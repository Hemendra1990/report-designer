"use client";

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useReportType, createReportType } from '@/contexts/ReportTypeContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import SelectPrimaryObject from './steps/SelectPrimaryObject';
import ReportTypeDetails from './steps/ReportTypeDetails';
import DefineRelationships from './steps/DefineRelationships';
import ConfigureFilters from './steps/ConfigureFilters';

export default function CreateReportTypePage () {
  
  return <Suspense fallback={<div>Loading...</div>}>
    <CreateReportType />
  </Suspense>
}

function CreateReportType() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, dispatch } = useReportType();
  const templateType = searchParams.get('type');

  useEffect(() => {
    if (templateType) {
      dispatch({ type: 'SET_TEMPLATE_TYPE', payload: templateType });
    }
  }, [templateType, dispatch]);

  const steps = [
    {
      title: 'Select Primary Object',
      component: SelectPrimaryObject,
    },
    {
      title: 'Report Type Details',
      component: ReportTypeDetails,
    },
    {
      title: 'Define Relationships',
      component: DefineRelationships,
    },
    {
      title: 'Configure Filters',
      component: ConfigureFilters,
    },
  ];

  const CurrentStepComponent = steps[state.step - 1].component;

  const handleNext = async () => {
    if (state.step === steps.length) {
      try {
        dispatch({ type: 'SET_SUBMITTING', payload: true });
        await createReportType(state.reportType);
        router.push('/report-types');
      } catch (error) {
        dispatch({ 
          type: 'SET_ERROR', 
          payload: error instanceof Error ? error.message : 'Failed to create report type' 
        });
      } finally {
        dispatch({ type: 'SET_SUBMITTING', payload: false });
      }
    } else {
      dispatch({ type: 'NEXT_STEP' });
    }
  };

  const handlePrevious = () => {
    if (state.step === 1) {
      router.push('/report-types');
    } else {
      dispatch({ type: 'PREVIOUS_STEP' });
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="flex items-center"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  index + 1 === state.step
                    ? 'bg-primary text-primary-foreground'
                    : index + 1 < state.step
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {index + 1}
              </div>
              <div
                className={`ml-3 text-sm font-medium ${
                  index + 1 === state.step
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                }`}
              >
                {step.title}
              </div>
              {index < steps.length - 1 && (
                <div className="mx-4 h-px w-16 bg-border" />
              )}
            </div>
          ))}
        </div>

        {/* Error Message */}
        {state.error && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md">
            {state.error}
          </div>
        )}

        {/* Step Content */}
        <Card className="p-6">
          <CurrentStepComponent />
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={state.isSubmitting}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {state.step === 1 ? 'Cancel' : 'Previous'}
          </Button>
          <Button
            onClick={handleNext}
            disabled={state.isSubmitting}
          >
            {state.step === steps.length ? (
              state.isSubmitting ? 'Creating...' : 'Create Report Type'
            ) : (
              <>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
} 