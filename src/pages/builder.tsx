import { forwardRef, useMemo, useRef, useState } from 'react';
import {
  User,
  Briefcase,
  GraduationCap,
  Sparkles,
  Award,
  LayoutTemplate,
  Eye,
  Download,
  RotateCcw,
  Save,
  Loader2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { useCvStore } from '@/hooks/use-cv-store';
import { validateCv, cvCompletion } from '@/lib/validation';
import { downloadCvPdf } from '@/lib/pdf';
import { CvPreview } from '@/components/cv/cv-preview';
import { PersonalSection } from '@/components/builder/sections/personal-section';
import { ExperienceSection } from '@/components/builder/sections/experience-section';
import { EducationSection } from '@/components/builder/sections/education-section';
import {
  SkillsSection,
  LanguagesSection,
  InterestsSection,
} from '@/components/builder/sections/skills-section';
import {
  CertificationsSection,
  ProjectsSection,
  RefereesSection,
  CustomSectionsSection,
} from '@/components/builder/sections/extra-sections';
import { TemplateCustomizationSection } from '@/components/builder/sections/template-section';
import type { CvData } from '@/types/cv';

type SectionKey =
  | 'personal'
  | 'experience'
  | 'education'
  | 'skills'
  | 'additional'
  | 'template'
  | 'preview';

interface NavItem {
  key: SectionKey;
  label: string;
  icon: typeof User;
}

const navItems: NavItem[] = [
  { key: 'personal', label: 'Personal', icon: User },
  { key: 'experience', label: 'Experience', icon: Briefcase },
  { key: 'education', label: 'Education', icon: GraduationCap },
  { key: 'skills', label: 'Skills', icon: Sparkles },
  { key: 'additional', label: 'Additional', icon: Award },
  { key: 'template', label: 'Template', icon: LayoutTemplate },
];

interface Props {
  initialTemplate?: string;
}

export function Builder({ initialTemplate }: Props) {
  const { cv, setCv, savedAt, resetCv } = useCvStore();
  const [active, setActive] = useState<SectionKey>('personal');
  const [mobilePreview, setMobilePreview] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Apply template from URL query once on mount/when it changes
  const appliedTemplate = useRef<string | undefined>(initialTemplate);
  if (initialTemplate && appliedTemplate.current !== initialTemplate) {
    appliedTemplate.current = initialTemplate;
    setCv((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        template: initialTemplate as CvData['settings']['template'],
      },
    }));
  }

  const validation = useMemo(() => validateCv(cv), [cv]);
  const completion = useMemo(() => cvCompletion(cv), [cv]);

  const onDownload = async () => {
    if (!validation.canDownload) {
      toast.error('Please add your name and at least one CV section before downloading.');
      setActive('personal');
      return;
    }
    if (!previewRef.current) return;
    setDownloading(true);
    try {
      await downloadCvPdf(previewRef.current, cv.personal.fullName);
      toast.success('Your CV has been downloaded.');
    } catch {
      toast.error('Something went wrong generating the PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const onReset = () => {
    resetCv();
    setActive('personal');
    toast.success('Started a new CV.');
  };

  const savedLabel = useMemo(() => {
    if (!savedAt) return 'Saving...';
    const d = new Date(savedAt);
    return `Saved ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }, [savedAt]);

  return (
    <div className="min-h-screen bg-secondary/20">
      {/* Builder header */}
      <div className="sticky top-16 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto max-w-[1600px] px-4 py-3 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-bold tracking-tight sm:text-xl">
                Create Your CV
              </h1>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Save className="h-3 w-3" />
                {savedLabel} — your CV is saved automatically on this device.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="hidden items-center gap-2 sm:flex">
                <Progress value={completion} className="h-2 w-24" />
                <span className="text-xs font-medium text-muted-foreground">
                  {completion}%
                </span>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Start New</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Start a new CV?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to start a new CV? Your current CV
                      data will be cleared from this device. This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={onReset}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Start New CV
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setMobilePreview(true)}
                className="lg:hidden"
              >
                <Eye className="mr-1.5 h-3.5 w-3.5" />
                Preview
              </Button>

              <Button size="sm" onClick={onDownload} disabled={downloading}>
                {downloading ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                )}
                <span className="hidden sm:inline">Download PDF</span>
                <span className="sm:hidden">PDF</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
          {/* Form column */}
          <div className="flex flex-col gap-4">
            {/* Section nav */}
            <div className="flex gap-1.5 overflow-x-auto rounded-lg border bg-card p-1.5">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActive(item.key)}
                  className={cn(
                    'inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                    active === item.key
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </div>

            {/* Form card */}
            <Card className="p-5 sm:p-6">
              {active === 'personal' && (
                <PersonalSection
                  cv={cv}
                  setCv={setCv}
                  errors={validation.errors}
                  onToast={(m) => toast(m)}
                />
              )}
              {active === 'experience' && (
                <ExperienceSection cv={cv} setCv={setCv} />
              )}
              {active === 'education' && (
                <EducationSection cv={cv} setCv={setCv} />
              )}
              {active === 'skills' && (
                <div className="space-y-8">
                  <SkillsSection cv={cv} setCv={setCv} />
                  <div className="border-t pt-6">
                    <LanguagesSection cv={cv} setCv={setCv} />
                  </div>
                  <div className="border-t pt-6">
                    <InterestsSection cv={cv} setCv={setCv} />
                  </div>
                </div>
              )}
              {active === 'additional' && (
                <div className="space-y-8">
                  <CertificationsSection cv={cv} setCv={setCv} />
                  <div className="border-t pt-6">
                    <ProjectsSection cv={cv} setCv={setCv} />
                  </div>
                  <div className="border-t pt-6">
                    <RefereesSection cv={cv} setCv={setCv} />
                  </div>
                  <div className="border-t pt-6">
                    <CustomSectionsSection cv={cv} setCv={setCv} />
                  </div>
                </div>
              )}
              {active === 'template' && (
                <TemplateCustomizationSection cv={cv} setCv={setCv} />
              )}
            </Card>

            {/* Prev/next */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                disabled={navItems.findIndex((n) => n.key === active) === 0}
                onClick={() => {
                  const idx = navItems.findIndex((n) => n.key === active);
                  if (idx > 0) setActive(navItems[idx - 1].key);
                }}
              >
                Previous
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={navItems.findIndex((n) => n.key === active) === navItems.length - 1}
                onClick={() => {
                  const idx = navItems.findIndex((n) => n.key === active);
                  if (idx < navItems.length - 1) setActive(navItems[idx + 1].key);
                }}
              >
                Next section
              </Button>
            </div>
          </div>

          {/* Preview column — desktop */}
          <div className="hidden lg:flex lg:flex-col lg:sticky lg:top-32 lg:max-h-[calc(100vh-9rem)]">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-muted-foreground">
                Live Preview
              </h2>
              <Badge variant="secondary" className="gap-1">
                <Eye className="h-3 w-3" />
                {cv.settings.template === 'ats'
                  ? 'ATS'
                  : cv.settings.template === 'professional'
                  ? 'Professional'
                  : 'Modern'}
              </Badge>
            </div>
            <PreviewPane
              ref={previewRef}
              cv={cv}
              completion={completion}
              canDownload={validation.canDownload}
              onDownload={onDownload}
              downloading={downloading}
            />
          </div>
        </div>
      </div>

      {/* Mobile preview drawer */}
      {mobilePreview && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobilePreview(false)}
          />
          <div className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-background shadow-xl">
            <div className="flex items-center justify-between border-b p-3">
              <h2 className="font-semibold">CV Preview</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobilePreview(false)}
                aria-label="Close preview"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 preview-scroll">
              <div ref={previewRef} className="shadow-md">
                <CvPreview cv={cv} />
              </div>
            </div>
            <div className="border-t p-3">
              <Button
                className="w-full"
                onClick={onDownload}
                disabled={downloading}
              >
                {downloading ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-1.5 h-4 w-4" />
                )}
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Preview pane with scroll, used on desktop. The ref points at the actual
   CV element for PDF capture. */
const PreviewPane = forwardRef<
  HTMLDivElement,
  {
    cv: CvData;
    completion: number;
    canDownload: boolean;
    onDownload: () => void;
    downloading: boolean;
  }
>(({ cv, completion, canDownload, onDownload, downloading }, ref) => {
  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-lg border bg-muted/40">
      <div className="flex-1 overflow-y-auto preview-scroll p-3 sm:p-4">
        <div ref={ref} className="mx-auto shadow-md" style={{ width: '100%' }}>
          <CvPreview cv={cv} />
        </div>
      </div>
      {!canDownload && (
        <div className="border-t bg-secondary/50 px-4 py-2 text-xs text-muted-foreground">
          <span className="font-medium">Tip:</span> Add your name and at least
          one section to download your CV. ({completion}% complete)
        </div>
      )}
    </div>
  );
});

PreviewPane.displayName = 'PreviewPane';
