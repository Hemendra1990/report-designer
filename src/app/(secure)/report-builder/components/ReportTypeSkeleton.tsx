import React from 'react';
import { cn } from "@/lib/utils";

export const ReportTypeSkeleton: React.FC = () => {
  return (
    <div className="group p-3 rounded-md transition-all border border-slate-200 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex gap-2.5">
          <div className="w-8 h-8 rounded-md bg-slate-200 flex-shrink-0" />
          <div className="flex-1">
            <div className="h-4 w-32 bg-slate-200 rounded mb-2"></div>
            <div className="flex items-center mt-0.5 gap-2">
              <div className="h-3 w-16 bg-slate-200 rounded"></div>
              <div className="h-3 w-24 bg-slate-200 rounded"></div>
            </div>
            <div className="h-3 w-40 bg-slate-200 rounded mt-2"></div>
          </div>
        </div>
        <div className="h-4 w-4 bg-slate-200 rounded"></div>
      </div>
      <div className="mt-2 pt-2 border-t border-dashed border-slate-200 flex gap-1.5 flex-wrap">
        <div className="h-4 w-16 bg-slate-200 rounded"></div>
        <div className="h-4 w-16 bg-slate-200 rounded"></div>
      </div>
    </div>
  );
};

export const ReportTypesSkeletonList: React.FC = () => {
  return (
    <>
      {[1, 2, 3, 4].map((i) => (
        <ReportTypeSkeleton key={i} />
      ))}
    </>
  );
};

export const FieldSkeleton: React.FC = () => {
  return (
    <div 
      className="flex items-center justify-between py-1 px-1.5 hover:bg-slate-50 rounded text-xs group animate-pulse"
    >
      <div className="flex items-center gap-1.5">
        <div className="w-5 h-5 rounded bg-slate-200"></div>
        <div>
          <div className="h-3 w-16 bg-slate-200 rounded"></div>
          <div className="h-2 w-12 bg-slate-200 rounded mt-1"></div>
        </div>
      </div>
      <div className="h-3 w-8 bg-slate-200 rounded"></div>
    </div>
  );
};

export const FieldsSkeletonList: React.FC = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((category) => (
        <div key={category}>
          <div className="h-3 w-24 bg-slate-200 rounded mb-1"></div>
          <div className="space-y-0.5">
            {[1, 2, 3, 4].map((field) => (
              <FieldSkeleton key={`${category}-${field}`} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}; 