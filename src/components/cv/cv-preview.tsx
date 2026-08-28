import { forwardRef } from 'react';
import type { CvData } from '@/types/cv';
import { ModernTemplate } from '@/components/cv/modern-template';
import { ProfessionalTemplate } from '@/components/cv/professional-template';
import { AtsTemplate } from '@/components/cv/ats-template';

interface Props {
  cv: CvData;
}

export const CvPreview = forwardRef<HTMLDivElement, Props>(({ cv }, ref) => {
  switch (cv.settings.template) {
    case 'professional':
      return <ProfessionalTemplate ref={ref} cv={cv} />;
    case 'ats':
      return <AtsTemplate ref={ref} cv={cv} />;
    case 'modern':
    default:
      return <ModernTemplate ref={ref} cv={cv} />;
  }
});

CvPreview.displayName = 'CvPreview';
