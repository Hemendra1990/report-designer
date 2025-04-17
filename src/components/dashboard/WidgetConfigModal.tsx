'use client';

import React, {useState, useEffect} from 'react';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter} from '@/components/ui/dialog';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Button} from '@/components/ui/button';
import {Label} from '@/components/ui/label';
import {Input} from '@/components/ui/input';
import {Switch} from '@/components/ui/switch';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {ScrollArea} from '@/components/ui/scroll-area';
import {useDashboard} from '@/contexts/DashboardContext';
import {ChartType, DashboardWidget, ChartConfig, TooltipConfig, LegendConfig} from '@/types/dashboard';
import {Report} from '@/types/report';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {HexColorPicker} from 'react-colorful';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import {ChartPreview} from '@/components/ChartPreview';
import {
    BarChart3,
    LineChart,
    PieChart,
    ScatterChart,
    ChartArea,
    CircleDot,
    Gauge,
    Grid3x3,
    Donut,
    Funnel
} from 'lucide-react';

// Sample data structure formatted for ChartPreview
const sampleData = {
    labels: ['Category A', 'Category B', 'Category C', 'Category D', 'Category E'],
    datasets: [
        {
            label: 'Values',
            data: [65, 45, 75, 25, 55]
        },
        {
            label: 'Count',
            data: [10, 20, 30, 15, 25]
        }
    ]
};

// Define a simplified chart configuration interface that matches our component needs
interface CustomChartConfig {
    type: ChartType;
    reportId: string;
    title: string;
    description: string;
    showLegend: boolean;
    legendPosition: string;
    showTooltip: boolean;
    showGrid: boolean;
    colors: string[];
    responsive: boolean;
    xAxisField: string;
    yAxisField: string;
    nameField: string;
    valueField: string;
    stacked: boolean;
}

interface WidgetConfigModalProps {
    isOpen?: boolean;
    onClose?: () => void;
    widgetId?: string;
    initialConfig?: Partial<CustomChartConfig>;
    reports?: Report[];
}

const WidgetConfigModal = ({
    isOpen = false,
    onClose = () => {},
    widgetId,
    initialConfig,
    reports = []
}: WidgetConfigModalProps) => {
    const {dashboardData, setDashboardData} = useDashboard();
    const [activeTab, setActiveTab] = useState('data');
    const [chartConfig, setChartConfig] = useState<CustomChartConfig>({
        type: 'bar',
        reportId: '',
        title: '',
        description: '',
        showLegend: true,
        legendPosition: 'right',
        showTooltip: true,
        showGrid: true,
        colors: ['#2563eb', '#16a34a', '#ef4444', '#eab308', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'],
        responsive: true,
        xAxisField: '',
        yAxisField: '',
        nameField: '',
        valueField: '',
        stacked: false
    });

    // Effect to load existing widget data if editing
    useEffect(() => {
        if (widgetId) {
            const widget = dashboardData.widgets.find(w => w.id === widgetId);
            if (widget && widget.config) {
                setChartConfig({
                    ...chartConfig,
                    // Map the config properties from the saved widget config
                    type: widget.chartType || 'bar',
                    title: widget.title || '',
                    reportId: widget.reportId || '',
                    // Add other properties based on your saved configuration structure
                });
            }
        } else if (initialConfig) {
            setChartConfig({
                ...chartConfig,
                ...initialConfig
            });
        }
    }, [widgetId, dashboardData.widgets, initialConfig, chartConfig]);

    // Update color at a specific index
    const updateColorAtIndex = (color: string, index: number) => {
        const newColors = [...chartConfig.colors];
        newColors[index] = color;
        setChartConfig({...chartConfig, colors: newColors});
    };

    // Add a new color to the palette
    const addColor = () => {
        const newColors = [...chartConfig.colors, '#000000'];
        setChartConfig({...chartConfig, colors: newColors});
    };

    // Remove a color from the palette
    const removeColor = (index: number) => {
        const newColors = [...chartConfig.colors];
        newColors.splice(index, 1);
        setChartConfig({...chartConfig, colors: newColors});
    };

    // Handle form submission
    const handleSubmit = () => {
        // Check if there are any reports available
        if (!reports || reports.length === 0) {
            alert('No reports available to create a widget');
            return;
        }

        // Validate config (basic validation example)
        if (!chartConfig.reportId || !chartConfig.type) {
            alert('Please select a report and chart type');
            return;
        }

        // Convert the custom config to the ChartConfig format expected by DashboardWidget
        const standardConfig: ChartConfig = {
            tooltip: { 
                show: chartConfig.showTooltip 
            } as TooltipConfig,
            legend: { 
                show: chartConfig.showLegend, 
                position: chartConfig.legendPosition as 'top' | 'bottom' | 'left' | 'right' 
            } as LegendConfig
        };

        if (widgetId) {
            // Update existing widget
            const updatedWidgets = dashboardData.widgets.map(widget => 
                widget.id === widgetId 
                    ? {
                        ...widget, 
                        title: chartConfig.title || widget.title, 
                        chartType: chartConfig.type, 
                        reportId: chartConfig.reportId,
                        config: standardConfig
                      } 
                    : widget
            );
            
            setDashboardData({
                ...dashboardData,
                widgets: updatedWidgets
            });
        } else {
            // Add new widget
            const id = Math.random().toString(36).substr(2, 9);
            const newLayout = {
                i: id,
                x: (dashboardData.widgets.length * 4) % 12,
                y: 0,
                w: 4,
                h: 4,
                minW: 2,
                minH: 2
            };

            const newWidget: DashboardWidget = {
                id,
                type: 'chart',
                title: chartConfig.title,
                layout: newLayout,
                chartType: chartConfig.type,
                reportId: chartConfig.reportId,
                config: standardConfig
            };

            setDashboardData({
                ...dashboardData,
                widgets: [...dashboardData.widgets, newWidget],
                layouts: {
                    lg: [...(dashboardData.layouts.lg || []), newLayout],
                    md: [...(dashboardData.layouts.md || []), { ...newLayout, w: 3 }],
                    sm: [...(dashboardData.layouts.sm || []), { ...newLayout, w: 2 }]
                }
            });
        }
        onClose();
    };

    // Get available fields from sample data
    const getAvailableFields = () => {
        return Object.keys(sampleData.datasets[0]).concat(['category']);
    };

    // Convert chart type to ChartPreview compatible type
    const getChartPreviewType = (type: ChartType): 'bar' | 'line' | 'pie' | 'scatter' | 'doughnut' | 'funnel' | 'grouped-bar' | 'stacked-bar' | 'gauge' | 'metric' | 'table' => {
        switch (type) {
            case 'bar': return 'bar';
            case 'line': return 'line';
            case 'pie': return 'pie';
            case 'scatter': return 'scatter';
            case 'doughnut': return 'doughnut';
            case 'funnel': return 'funnel';
            case 'grid': return 'table';
            case 'radialBar': return 'gauge';
            case 'area': return 'line'; // Fallback to line
            case 'radar': return 'pie'; // Fallback to pie
            default: return 'bar';
        }
    };

    const isCartesianChart = ['bar', 'line', 'area', 'scatter', 'grid'].includes(chartConfig.type || '');
    const isRadialChart = ['pie', 'doughnut', 'radar', 'radialBar'].includes(chartConfig.type || '');

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
        >
            <DialogContent className="max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader className="pb-2 mb-0">
                    <DialogTitle className="text-lg font-semibold">
                        {widgetId ? 'Edit Widget' : 'Add New Widget'}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-1 overflow-hidden space-x-4">
                    {/* Left side - Configuration */}
                    <div className="w-1/2 overflow-hidden flex flex-col">
                        <Tabs 
                            defaultValue="data" 
                            value={activeTab}
                            onValueChange={setActiveTab}
                            className="flex-1 overflow-hidden flex flex-col"
                        >
                            <TabsList className="grid grid-cols-2 w-48 mb-3">
                                <TabsTrigger value="data" className="text-xs">Data & Info</TabsTrigger>
                                <TabsTrigger value="style" className="text-xs">Style</TabsTrigger>
                            </TabsList>

                            <ScrollArea className="flex-1 overflow-auto pr-4">
                                <TabsContent value="data" className="space-y-3 mt-0">
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="title" className="text-xs font-medium">Widget Title</Label>
                                                <Input
                                                    id="title"
                                                    value={chartConfig.title}
                                                    onChange={(e) => setChartConfig({...chartConfig, title: e.target.value})}
                                                    placeholder="Enter widget title"
                                                    className="text-xs h-8"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label htmlFor="description" className="text-xs font-medium">Description (Optional)</Label>
                                                <Input
                                                    id="description"
                                                    value={chartConfig.description}
                                                    onChange={(e) => setChartConfig({...chartConfig, description: e.target.value})}
                                                    placeholder="Enter widget description"
                                                    className="text-xs h-8"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="report" className="text-xs font-medium">Data Source</Label>
                                            <Select
                                                value={chartConfig.reportId}
                                                onValueChange={(value) => setChartConfig({...chartConfig, reportId: value})}
                                            >
                                                <SelectTrigger id="report" className="text-xs h-8">
                                                    <SelectValue placeholder="Select data source" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {reports && reports.length > 0 ? (
                                                        reports.map((report) => (
                                                            <SelectItem key={report.id} value={report.id} className="text-xs">
                                                                {report.name}
                                                            </SelectItem>
                                                        ))
                                                    ) : (
                                                        <SelectItem value="no-reports" className="text-xs" disabled>
                                                            No reports available
                                                        </SelectItem>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-medium">Chart Type</Label>
                                            <div className="grid grid-cols-10 gap-1">
                                                <Button
                                                    type="button"
                                                    variant={chartConfig.type === 'bar' ? 'default' : 'outline'}
                                                    onClick={() => setChartConfig({...chartConfig, type: 'bar'})}
                                                    className="flex items-center justify-center h-10 w-10 p-2"
                                                    size="sm"
                                                    title="Bar Chart"
                                                >
                                                    <BarChart3 className="h-5 w-5" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant={chartConfig.type === 'line' ? 'default' : 'outline'}
                                                    onClick={() => setChartConfig({...chartConfig, type: 'line'})}
                                                    className="flex items-center justify-center h-10 w-10 p-2"
                                                    size="sm"
                                                    title="Line Chart"
                                                >
                                                    <LineChart className="h-5 w-5" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant={chartConfig.type === 'pie' ? 'default' : 'outline'}
                                                    onClick={() => setChartConfig({...chartConfig, type: 'pie'})}
                                                    className="flex items-center justify-center h-10 w-10 p-2"
                                                    size="sm"
                                                    title="Pie Chart"
                                                >
                                                    <PieChart className="h-5 w-5" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant={chartConfig.type === 'doughnut' ? 'default' : 'outline'}
                                                    onClick={() => setChartConfig({...chartConfig, type: 'doughnut'})}
                                                    className="flex items-center justify-center h-10 w-10 p-2"
                                                    size="sm"
                                                    title="Doughnut Chart"
                                                >
                                                    <Donut className="h-5 w-5" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant={chartConfig.type === 'area' ? 'default' : 'outline'}
                                                    onClick={() => setChartConfig({...chartConfig, type: 'area'})}
                                                    className="flex items-center justify-center h-10 w-10 p-2"
                                                    size="sm"
                                                    title="Area Chart"
                                                >
                                                    <ChartArea className="h-5 w-5" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant={chartConfig.type === 'scatter' ? 'default' : 'outline'}
                                                    onClick={() => setChartConfig({...chartConfig, type: 'scatter'})}
                                                    className="flex items-center justify-center h-10 w-10 p-2"
                                                    size="sm"
                                                    title="Scatter Chart"
                                                >
                                                    <ScatterChart className="h-5 w-5" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant={chartConfig.type === 'radar' ? 'default' : 'outline'}
                                                    onClick={() => setChartConfig({...chartConfig, type: 'radar'})}
                                                    className="flex items-center justify-center h-10 w-10 p-2"
                                                    size="sm"
                                                    title="Radar Chart"
                                                >
                                                    <CircleDot className="h-5 w-5" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant={chartConfig.type === 'radialBar' ? 'default' : 'outline'}
                                                    onClick={() => setChartConfig({...chartConfig, type: 'radialBar'})}
                                                    className="flex items-center justify-center h-10 w-10 p-2"
                                                    size="sm"
                                                    title="Radial Bar Chart"
                                                >
                                                    <Gauge className="h-5 w-5" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant={chartConfig.type === 'grid' ? 'default' : 'outline'}
                                                    onClick={() => setChartConfig({...chartConfig, type: 'grid'})}
                                                    className="flex items-center justify-center h-10 w-10 p-2"
                                                    size="sm"
                                                    title="Grid/Table"
                                                >
                                                    <Grid3x3 className="h-5 w-5" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant={chartConfig.type === 'funnel' ? 'default' : 'outline'}
                                                    onClick={() => setChartConfig({...chartConfig, type: 'funnel'})}
                                                    className="flex items-center justify-center h-10 w-10 p-2"
                                                    size="sm"
                                                    title="Funnel Chart"
                                                >
                                                    <Funnel className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </div>

                                        {chartConfig.reportId && (
                                            <>
                                                {isCartesianChart && (
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="space-y-1.5">
                                                            <Label htmlFor="xAxisField" className="text-xs font-medium">X-Axis Field</Label>
                                                            <Select
                                                                value={chartConfig.xAxisField}
                                                                onValueChange={(value) => setChartConfig({...chartConfig, xAxisField: value})}
                                                            >
                                                                <SelectTrigger id="xAxisField" className="text-xs h-8">
                                                                    <SelectValue placeholder="Select field" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {getAvailableFields().map((field) => (
                                                                        <SelectItem key={field} value={field} className="text-xs">
                                                                            {field}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <Label htmlFor="yAxisField" className="text-xs font-medium">Y-Axis Field</Label>
                                                            <Select
                                                                value={chartConfig.yAxisField}
                                                                onValueChange={(value) => setChartConfig({...chartConfig, yAxisField: value})}
                                                            >
                                                                <SelectTrigger id="yAxisField" className="text-xs h-8">
                                                                    <SelectValue placeholder="Select field" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {getAvailableFields().map((field) => (
                                                                        <SelectItem key={field} value={field} className="text-xs">
                                                                            {field}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>
                                                )}

                                                {isRadialChart && (
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="space-y-1.5">
                                                            <Label htmlFor="nameField" className="text-xs font-medium">Name Field</Label>
                                                            <Select
                                                                value={chartConfig.nameField}
                                                                onValueChange={(value) => setChartConfig({...chartConfig, nameField: value})}
                                                            >
                                                                <SelectTrigger id="nameField" className="text-xs h-8">
                                                                    <SelectValue placeholder="Select field" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {getAvailableFields().map((field) => (
                                                                        <SelectItem key={field} value={field} className="text-xs">
                                                                            {field}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <Label htmlFor="valueField" className="text-xs font-medium">Value Field</Label>
                                                            <Select
                                                                value={chartConfig.valueField}
                                                                onValueChange={(value) => setChartConfig({...chartConfig, valueField: value})}
                                                            >
                                                                <SelectTrigger id="valueField" className="text-xs h-8">
                                                                    <SelectValue placeholder="Select field" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {getAvailableFields().map((field) => (
                                                                        <SelectItem key={field} value={field} className="text-xs">
                                                                            {field}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </TabsContent>

                                <TabsContent value="style" className="space-y-3 mt-0">
                                    <Accordion type="multiple" className="w-full">
                                        {/* General Settings Section */}
                                        <AccordionItem value="general">
                                            <AccordionTrigger className="text-xs font-medium py-1.5">General</AccordionTrigger>
                                            <AccordionContent>
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <Label htmlFor="responsive" className="text-xs">Responsive</Label>
                                                        <Switch
                                                            id="responsive"
                                                            checked={chartConfig.responsive}
                                                            onCheckedChange={(checked) => setChartConfig({...chartConfig, responsive: checked})}
                                                        />
                                                    </div>
                                                    
                                                    {isCartesianChart && (
                                                        <div className="flex items-center justify-between">
                                                            <Label htmlFor="stacked" className="text-xs">Stacked</Label>
                                                            <Switch
                                                                id="stacked"
                                                                checked={chartConfig.stacked}
                                                                onCheckedChange={(checked) => setChartConfig({...chartConfig, stacked: checked})}
                                                            />
                                                        </div>
                                                    )}
                                                    
                                                    {isCartesianChart && (
                                                        <div className="flex items-center justify-between">
                                                            <Label htmlFor="showGrid" className="text-xs">Show Grid</Label>
                                                            <Switch
                                                                id="showGrid"
                                                                checked={chartConfig.showGrid}
                                                                onCheckedChange={(checked) => setChartConfig({...chartConfig, showGrid: checked})}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                        
                                        {/* Tooltip Settings Section */}
                                        <AccordionItem value="tooltip">
                                            <AccordionTrigger className="text-xs font-medium py-1.5">Tooltip</AccordionTrigger>
                                            <AccordionContent>
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <Label htmlFor="showTooltip" className="text-xs">Show Tooltip</Label>
                                                        <Switch
                                                            id="showTooltip"
                                                            checked={chartConfig.showTooltip}
                                                            onCheckedChange={(checked) => setChartConfig({...chartConfig, showTooltip: checked})}
                                                        />
                                                    </div>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                        
                                        {/* Legend Settings Section */}
                                        <AccordionItem value="legend">
                                            <AccordionTrigger className="text-xs font-medium py-1.5">Legend</AccordionTrigger>
                                            <AccordionContent>
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <Label htmlFor="showLegend" className="text-xs">Show Legend</Label>
                                                        <Switch
                                                            id="showLegend"
                                                            checked={chartConfig.showLegend}
                                                            onCheckedChange={(checked) => setChartConfig({...chartConfig, showLegend: checked})}
                                                        />
                                                    </div>
                                                    
                                                    {chartConfig.showLegend && (
                                                        <div className="space-y-1.5">
                                                            <Label htmlFor="legendPosition" className="text-xs">Legend Position</Label>
                                                            <Select
                                                                value={chartConfig.legendPosition}
                                                                onValueChange={(value) => setChartConfig({...chartConfig, legendPosition: value})}
                                                            >
                                                                <SelectTrigger id="legendPosition" className="text-xs h-8">
                                                                    <SelectValue placeholder="Select position" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="top" className="text-xs">Top</SelectItem>
                                                                    <SelectItem value="right" className="text-xs">Right</SelectItem>
                                                                    <SelectItem value="bottom" className="text-xs">Bottom</SelectItem>
                                                                    <SelectItem value="left" className="text-xs">Left</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    )}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                        
                                        {/* Color Palette Section */}
                                        <AccordionItem value="colors">
                                            <AccordionTrigger className="text-xs font-medium py-1.5">Color Palette</AccordionTrigger>
                                            <AccordionContent>
                                                <div className="space-y-2">
                                                    <div className="grid grid-cols-4 gap-2">
                                                        {chartConfig.colors.map((color, index) => (
                                                            <div key={index} className="space-y-1">
                                                                <div className="flex items-center justify-between">
                                                                    <div 
                                                                        className="w-5 h-5 rounded-md border" 
                                                                        style={{backgroundColor: color}}
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        className="text-[10px] text-red-500"
                                                                        onClick={() => removeColor(index)}
                                                                    >
                                                                        Remove
                                                                    </button>
                                                                </div>
                                                                <HexColorPicker 
                                                                    color={color} 
                                                                    onChange={(newColor) => updateColorAtIndex(newColor, index)} 
                                                                    style={{width: 'auto', height: '100px'}}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <Button 
                                                        type="button" 
                                                        variant="outline" 
                                                        onClick={addColor}
                                                        className="w-full text-xs"
                                                        size="sm"
                                                    >
                                                        Add Color
                                                    </Button>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </TabsContent>
                            </ScrollArea>
                        </Tabs>
                    </div>

                    {/* Right side - Preview */}
                    <div className="w-1/2 h-[50vh]">
                        <Card className="h-full flex flex-col overflow-hidden">
                            <CardHeader className="py-2">
                                <CardTitle className="text-xs font-medium">Chart Preview</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 p-0 flex items-center justify-center">
                                <div className="w-full h-full p-2">
                                    <ChartPreview
                                        type={getChartPreviewType(chartConfig.type)}
                                        data={sampleData}
                                        config={{
                                            tooltip: { 
                                                show: chartConfig.showTooltip 
                                            },
                                            legend: { 
                                                show: chartConfig.showLegend, 
                                                position: chartConfig.legendPosition as 'top' | 'bottom' | 'left' | 'right' 
                                            }
                                        }}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <DialogFooter className="pt-2 mt-2">
                    <Button variant="outline" onClick={onClose} size="sm" className="text-xs h-8">Cancel</Button>
                    <Button type="button" onClick={handleSubmit} size="sm" className="text-xs h-8">Save Widget</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default WidgetConfigModal; 