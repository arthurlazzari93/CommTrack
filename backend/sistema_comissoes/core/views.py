from rest_framework import viewsets
from .models import Cliente, Plano, Parcela, Consultor, Venda, ControleDeRecebimento
from .serializers import ClienteSerializer, PlanoSerializer, ParcelaSerializer, ConsultorSerializer, VendaSerializer, ControleDeRecebimentoSerializer

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
    
# Repita para os demais modelos...
