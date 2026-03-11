from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Attempt, AttemptAnswer
from .serializers import AttemptSerializer, AttemptAnswerSerializer
from services.evaluation import QuizEvaluationService

class AttemptViewSet(viewsets.ModelViewSet):
    serializer_class = AttemptSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Users can only see their own attempts
        return Attempt.objects.filter(user=self.request.user).order_by('-start_time')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def answer(self, request, pk=None):
        attempt = self.get_object()
        if attempt.status == 'COMPLETED':
            return Response({'error': 'Attempt already completed'}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = AttemptAnswerSerializer(data=request.data)
        if serializer.is_valid():
            # Check if answer already exists and update, or create
            AttemptAnswer.objects.update_or_create(
                attempt=attempt,
                question=serializer.validated_data['question'],
                defaults={'selected_choice': serializer.validated_data['selected_choice']}
            )
            return Response({'status': 'Answer saved'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        attempt = self.get_object()
        if attempt.status == 'COMPLETED':
            return Response({'error': 'Already submitted'}, status=status.HTTP_400_BAD_REQUEST)

        evaluated_attempt = QuizEvaluationService.evaluate_attempt(attempt.id)
        return Response({'score': evaluated_attempt.score}, status=status.HTTP_200_OK)
