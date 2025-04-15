'use client';

import React, {useState, useEffect} from 'react';
import {Dialog, DialogContent, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Button} from '@/components/ui/button';
import {Label} from '@/components/ui/label';
import {Input} from '@/components/ui/input';
import {Switch} from '@/components/ui/switch';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {ScrollArea} from '@/components/ui/scroll-area';
import {useDashboard} from '@/contexts/DashboardContext';
import {Report} from '@/types/report';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {
    ChartType,
    ChartConfig,
    CartesianChartConfig,
    PieChartConfig,
    RadarChartConfig,
    TooltipConfig,
    LegendConfig
} from '@/types/dashboard';
import {HexColorPicker} from 'react-colorful';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import {ChartPreview} from '@/components/ChartPreview';
import {BarChart3, LineChart, PieChart, ScatterChart, AreaChart, CircleDot} from 'lucide-react';

interface WidgetConfigModalProps {
    // Remove props as we'll get them from context
}

const WidgetConfigModal: React.FC<WidgetConfigModalProps> = () => {
    const {
        selectedReport,
        chartType,
        setChartType,
        yAxisFields,
        toggleYAxisField,
        xAxisField,
        setXAxisField,
        displayUnits,
        setDisplayUnits,
        availableFields,
        activeTab,
        setActiveTab,
        handleSaveWidget,
        showWidgetConfig,
        toggleWidgetConfig
    } = useDashboard();

    const [chartConfig, setChartConfig] = useState<ChartConfig>({
        cartesian: {
            grid: true,
            margins: {top: 20, right: 20, bottom: 20, left: 20},
            colors: ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe'],
            strokeWidth: 2,
            barSize: 20,
            barGap: 4,
        },
        tooltip: {
            show: true,
            formatter: (value) => `${value}`,
        },
        legend: {
            show: true,
            position: 'bottom',
            align: 'center',
        },
        pie: {
            innerRadius: 0,
            outerRadius: 80,
            paddingAngle: 0,
            cornerRadius: 0,
            startAngle: 0,
            endAngle: 360,
        },
        radar: {
            outerRadius: 80,
            startAngle: 90,
            endAngle: 450,
        },
    });

    const handleToggleYAxisField = (field: string) => {
        toggleYAxisField(field);
    };

    const handleChartTypeChange = (type: ChartType) => {
        setChartType(type);
    };

    const handleSave = () => {
        handleSaveWidget(chartConfig);
        toggleWidgetConfig(false);
    };

    const updateCartesianConfig = (key: keyof CartesianChartConfig, value: any) => {
        setChartConfig(prev => ({
            ...prev,
            cartesian: {
                ...prev.cartesian,
                [key]: value
            }
        }));
    };

    const updateTooltipConfig = (key: keyof TooltipConfig, value: any) => {
        setChartConfig(prev => ({
            ...prev,
            tooltip: {
                ...prev.tooltip,
                [key]: value
            }
        }));
    };

    const updateLegendConfig = (key: keyof LegendConfig, value: any) => {
        setChartConfig(prev => ({
            ...prev,
            legend: {
                ...prev.legend,
                [key]: value
            }
        }));
    };

    const updatePieConfig = (key: keyof PieChartConfig, value: any) => {
        setChartConfig(prev => ({
            ...prev,
            pie: {
                ...prev.pie,
                [key]: value
            }
        }));
    };

    const updateRadarConfig = (key: keyof RadarChartConfig, value: any) => {
        setChartConfig(prev => ({
            ...prev,
            radar: {
                ...prev.radar,
                [key]: value
            }
        }));
    };

    const updateCartesianMargin = (margin: string, value: number) => {
        setChartConfig(prev => ({
            ...prev,
            cartesian: {
                ...prev.cartesian,
                margins: {
                    ...prev.cartesian?.margins,
                    [margin]: value
                }
            }
        }));
    };

    const updateColor = (index: number, color: string) => {
        setChartConfig(prev => {
            const newColors = [...(prev.cartesian?.colors || [])];
            newColors[index] = color;
            return {
                ...prev,
                cartesian: {
                    ...prev.cartesian,
                    colors: newColors
                }
            };
        });
    };

    // Generate preview data based on selections
    const getPreviewData = () => {
        // Create sample data
        const sampleLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

        // Generate datasets based on selected fields
        let datasets = [];

        if (yAxisFields.length > 0) {
            // Create datasets based on selected y-axis fields
            datasets = yAxisFields.map((field, index) => ({
                label: field,
                data: Array(6).fill(0).map(() => Math.floor(Math.random() * 90) + 10),
            }));
        } else {
            // Default dataset if no fields selected
            datasets = [
                {
                    label: 'Sample Data',
                    data: [65, 59, 80, 81, 56, 55],
                },
                {
                    label: 'Sample Series 2',
                    data: [28, 48, 40, 19, 86, 27],
                }
            ];
        }

        return {
            labels: sampleLabels,
            datasets
        };
    };

    // Handle formatter selection
    const handleFormatterChange = (value: string) => {
        let formatter;
        switch (value) {
            case 'percent':
                formatter = (value: any) => `${value}%`;
                break;
            case 'currency':
                formatter = (value: any) => `$${value.toLocaleString()}`;
                break;
            case 'custom':
                formatter = (value: any) => `${value} units`;
                break;
            default:
                formatter = (value: any) => `${value}`;
        }

        updateTooltipConfig('formatter', formatter);
    };

    return (
        <Dialog open={showWidgetConfig} onOpenChange={() => toggleWidgetConfig(false)}>
            <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden flex flex-col p-0">
                <DialogHeader className="px-6 pt-6 pb-2">
                    <DialogTitle>Configure Widget</DialogTitle>
                </DialogHeader>

                <div className="flex-1 flex overflow-hidden h-[80vh]">
                    {/* Vertical Tabs Navigation */}
                    <div className="w-52 border-r flex-shrink-0">
                        <div className="p-3">
                            <div className="flex flex-col space-y-1">
                                <button
                                    onClick={() => setActiveTab('data-chart')}
                                    className={`px-4 py-2 text-left rounded-md transition-colors ${
                                        activeTab === 'data-chart'
                                            ? 'bg-blue-100 text-blue-700 font-medium'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    Data & Chart Type
                                </button>
                                <button
                                    onClick={() => setActiveTab('style')}
                                    className={`px-4 py-2 text-left rounded-md transition-colors ${
                                        activeTab === 'style'
                                            ? 'bg-blue-100 text-blue-700 font-medium'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    Styling & Appearance
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 overflow-auto p-6">
                        {activeTab === 'data-chart' && (
                            <div className="space-y-6">
                                {/* Data Source (compact) */}
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle>Data Source</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="p-3 border rounded-md bg-gray-50">
                                            <div
                                                className="font-medium">{selectedReport?.name || 'No report selected'}</div>
                                            {selectedReport && <div className="text-sm text-gray-500 mt-1">Created
                                                by {selectedReport.createdBy}</div>}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Chart Type Selection with Icons */}
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle>Chart Type</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-5 gap-3">
                                            <Button
                                                variant={chartType === 'bar' ? "default" : "outline"}
                                                onClick={() => handleChartTypeChange('bar')}
                                                className="h-20 flex flex-col gap-2 justify-center"
                                            >
                                                <BarChart3 size={24}/>
                                                <span>Bar</span>
                                            </Button>
                                            <Button
                                                variant={chartType === 'line' ? "default" : "outline"}
                                                onClick={() => handleChartTypeChange('line')}
                                                className="h-20 flex flex-col gap-2 justify-center"
                                            >
                                                <LineChart size={24}/>
                                                <span>Line</span>
                                            </Button>
                                            <Button
                                                variant={chartType === 'area' ? "default" : "outline"}
                                                onClick={() => handleChartTypeChange('area')}
                                                className="h-20 flex flex-col gap-2 justify-center"
                                            >
                                                <AreaChart size={24}/>
                                                <span>Area</span>
                                            </Button>
                                            <Button
                                                variant={chartType === 'pie' ? "default" : "outline"}
                                                onClick={() => handleChartTypeChange('pie')}
                                                className="h-20 flex flex-col gap-2 justify-center"
                                            >
                                                <PieChart size={24}/>
                                                <span>Pie</span>
                                            </Button>
                                            <Button
                                                variant={chartType === 'scatter' ? "default" : "outline"}
                                                onClick={() => handleChartTypeChange('scatter')}
                                                className="h-20 flex flex-col gap-2 justify-center"
                                            >
                                                <ScatterChart size={24}/>
                                                <span>Scatter</span>
                                            </Button>
                                            <Button
                                                variant={chartType === 'radar' ? "default" : "outline"}
                                                onClick={() => handleChartTypeChange('radar')}
                                                className="h-20 flex flex-col gap-2 justify-center"
                                            >
                                                <CircleDot size={24}/>
                                                <span>Radar</span>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Axis Configuration */}
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle>Axis Configuration</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="xAxis">X-Axis Field</Label>
                                                <Select
                                                    value={xAxisField}
                                                    onValueChange={setXAxisField}
                                                >
                                                    <SelectTrigger id="xAxis">
                                                        <SelectValue placeholder="Select X-Axis Field"/>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {availableFields.map(field => (
                                                            <SelectItem key={field} value={field}>{field}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div>
                                                <Label>Y-Axis Fields</Label>
                                                <ScrollArea className="h-[150px] border rounded p-2">
                                                    {availableFields.map(field => (
                                                        <div key={field}
                                                             className="flex items-center justify-between py-1">
                                                            <span>{field}</span>
                                                            <Switch
                                                                checked={yAxisFields.includes(field)}
                                                                onCheckedChange={() => handleToggleYAxisField(field)}
                                                            />
                                                        </div>
                                                    ))}
                                                </ScrollArea>
                                            </div>

                                            <div>
                                                <Label htmlFor="displayUnits">Display Units</Label>
                                                <Input
                                                    id="displayUnits"
                                                    value={displayUnits}
                                                    onChange={e => setDisplayUnits(e.target.value)}
                                                    placeholder="e.g. $, %, kg"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>


                            </div>
                        )}

                        {activeTab === 'style' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Color Palette</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {chartConfig.cartesian?.colors?.map((color, index) => (
                                            <div key={index} className="space-y-2">
                                                <Label className="block text-center">{`Color ${index + 1}`}</Label>
                                                <div
                                                    className="w-full h-8 rounded cursor-pointer border"
                                                    style={{backgroundColor: color}}
                                                />
                                                <HexColorPicker
                                                    color={color}
                                                    onChange={(newColor) => updateColor(index, newColor)}
                                                    className="w-full"
                                                />
                                                <Input
                                                    value={color}
                                                    onChange={(e) => updateColor(index, e.target.value)}
                                                    className="mt-2"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Preview Panel */}
                    <div className="w-1/3 border-l flex-shrink-0 p-4 flex flex-col">
                        <h3 className="text-sm font-medium mb-3">Chart Preview</h3>
                        <div className="flex-1 border rounded-md p-4 bg-gray-50 flex items-center justify-center">
                            <ChartPreview
                                type={chartType === 'bar' ? 'bar' :
                                    chartType === 'line' ? 'line' :
                                        chartType === 'pie' ? 'pie' :
                                            chartType === 'scatter' ? 'scatter' :
                                                chartType === 'area' ? 'line' : 'bar'}
                                config={chartConfig}
                                data={getPreviewData()}
                                height={300}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 p-4 border-t">
                    <Button variant="outline" onClick={() => toggleWidgetConfig(false)}>Cancel</Button>
                    <Button onClick={handleSave}>Save Widget</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default WidgetConfigModal; 