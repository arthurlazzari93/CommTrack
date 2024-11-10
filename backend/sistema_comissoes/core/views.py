from rest_framework import viewsets
from .models import Cliente, Plano, Parcela, Consultor, Venda, ControleDeRecebimento
from .serializers import ControleDeRecebimentoSerializer, ClienteSerializer, PlanoSerializer, ParcelaSerializer, ConsultorSerializer, VendaSerializer, ControleDeRecebimentoSerializer
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from django.utils import timezone
from rest_framework.decorators import api_view
from datetime import date



class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer

class PlanoViewSet(viewsets.ModelViewSet):
    queryset = Plano.objects.all()
    serializer_class = PlanoSerializer

class ParcelaViewSet(viewsets.ModelViewSet):
    queryset = Parcela.objects.all()
    serializer_class = ParcelaSerializer

class ConsultorViewSet(viewsets.ModelViewSet):
    queryset = Consultor.objects.all()
    serializer_class = ConsultorSerializer

class VendaViewSet(viewsets.ModelViewSet):
    queryset = Venda.objects.all()
    serializer_class = VendaSerializer

class ControleDeRecebimentoViewSet(viewsets.ModelViewSet):
    queryset = ControleDeRecebimento.objects.all()
    serializer_class = ControleDeRecebimentoSerializer

class ParcelasAtrasadasList(APIView):
    def get(self, request):
        hoje = date.today()
        # Atualizar status para 'Atrasado' se data prevista < hoje e status ainda for 'Não Recebido'
        ControleDeRecebimento.objects.filter(
            status='Não Recebido',
            data_prevista_recebimento__lt=hoje
        ).update(status='Atrasado')

        # Obter parcelas com status 'Atrasado'
        parcelas_atrasadas = ControleDeRecebimento.objects.filter(status='Atrasado')
        serializer = ControleDeRecebimentoSerializer(parcelas_atrasadas, many=True)
        return Response(serializer.data)

@api_view(['POST'])
def marcar_parcela_recebida(request, pk):
    try:
        parcela = ControleDeRecebimento.objects.get(pk=pk)
    except ControleDeRecebimento.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    parcela.status = 'Recebido'
    parcela.data_recebimento = timezone.now().date()
    parcela.save()
    return Response(status=status.HTTP_200_OK)


    
# Repita para os demais modelos...
