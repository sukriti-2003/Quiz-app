import { QuizAttempt } from "@/features/attempts/QuizAttempt";

export default function AttemptPage({ params }: { params: { id: string } }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <QuizAttempt quizId={params.id} />
    </div>
  );
}
