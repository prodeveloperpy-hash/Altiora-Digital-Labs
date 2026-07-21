import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GripVertical, Pencil, Plus, Trash2 } from 'lucide-react';
import { ADMIN_ROUTES } from '@/config/constants';
import {
  useDeleteQuestion,
  useQuestions,
  useReorderQuestions,
  useUpdateQuestion,
} from '@/features/admin/hooks';
import type { Question } from '@/features/admin/types';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useToast } from '@/context/toast/useToast';
import { isApiError } from '@/lib/apiError';
import { cn } from '@/lib/utils';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';

const TYPE_LABEL: Record<string, string> = {
  radio: 'Single choice',
  checkbox: 'Multiple choice',
  dropdown: 'Dropdown',
  number: 'Number',
  slider: 'Slider',
};

export default function QuestionsListPage() {
  useDocumentTitle('Questions');
  const navigate = useNavigate();
  const toast = useToast();

  const { data: questions, isLoading } = useQuestions();
  const reorder = useReorderQuestions();
  const updateQuestion = useUpdateQuestion();
  const deleteQuestion = useDeleteQuestion();

  const [ordered, setOrdered] = useState<Question[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Question | null>(null);

  // Keep local order in sync with the server, except mid-drag.
  useEffect(() => {
    if (questions && dragIndex === null) setOrdered(questions);
  }, [questions, dragIndex]);

  const handleDrop = (targetIndex: number) => {
    if (dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null);
      return;
    }
    const next = [...ordered];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(targetIndex, 0, moved!);
    setOrdered(next);
    setDragIndex(null);
    reorder.mutate(
      next.map((q) => q.id),
      {
        onSuccess: () => toast.success('Order saved', 'The questionnaire order was updated.'),
        onError: (error) =>
          toast.error('Reorder failed', isApiError(error) ? error.message : 'Please try again.'),
      },
    );
  };

  const toggleActive = async (question: Question) => {
    try {
      await updateQuestion.mutateAsync({
        id: question.id,
        payload: { isActive: !question.isActive },
      });
    } catch (error) {
      toast.error('Update failed', isApiError(error) ? error.message : 'Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteQuestion.mutateAsync(pendingDelete.id);
      toast.success('Question deleted', `“${pendingDelete.label}” was removed.`);
      setPendingDelete(null);
    } catch (error) {
      toast.error('Delete failed', isApiError(error) ? error.message : 'Please try again.');
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Questions"
        description="Drag to reorder. Each question feeds the recommendation engine via its answer key."
        breadcrumbs={[{ label: 'Dashboard', to: ADMIN_ROUTES.dashboard }, { label: 'Questions' }]}
        actions={
          <Button onClick={() => navigate(ADMIN_ROUTES.questionNew)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            New question
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : ordered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">No questions yet. Create your first one.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {ordered.map((question, index) => (
            <li
              key={question.id}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(index)}
              onDragEnd={() => setDragIndex(null)}
              className={cn(
                'flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-shadow',
                dragIndex === index && 'opacity-50 shadow-elevated',
              )}
            >
              <button
                type="button"
                className="cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing"
                aria-label="Drag to reorder"
              >
                <GripVertical className="h-5 w-5" />
              </button>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-foreground">{question.label}</span>
                  <Badge variant="secondary">{TYPE_LABEL[question.type] ?? question.type}</Badge>
                  {question.isRequired && <Badge variant="warning">Required</Badge>}
                  {!question.isActive && <Badge variant="default">Disabled</Badge>}
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  <code>{question.key}</code>
                  {question.options.length > 0 && ` · ${question.options.length} options`}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <label className="mr-1 inline-flex cursor-pointer items-center" title="Enable / disable">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={question.isActive}
                    onChange={() => toggleActive(question)}
                  />
                  <span className="relative h-5 w-9 rounded-full bg-muted transition-colors peer-checked:bg-primary after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-4" />
                </label>
                <Link
                  to={ADMIN_ROUTES.questionEdit(question.id)}
                  className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  aria-label={`Edit ${question.label}`}
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => setPendingDelete(question)}
                  aria-label={`Delete ${question.label}`}
                  className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete question"
        message={`Delete “${pendingDelete?.label}”? This removes it from the questionnaire.`}
        confirmLabel="Delete"
        destructive
        isLoading={deleteQuestion.isPending}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}
