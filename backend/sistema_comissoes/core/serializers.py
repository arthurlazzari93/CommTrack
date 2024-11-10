from rest_framework import serializers
from .models import Cliente, Plano, Parcela, Consultor, Venda, ControleDeRecebimento

class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = '__all__'

class PlanoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plano
        fields = '__all__'

class ParcelaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Parcela
        fields = '__all__'

class ConsultorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Consultor
        fields = '__all__'



class ControleDeRecebimentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ControleDeRecebimento
        fields = '__all__'


class VendaSerializer(serializers.ModelSerializer):
    cliente = ClienteSerializer()
    parcelas_recebimento = ControleDeRecebimentoSerializer(source='controlederecebimento_set', many=True)

    class Meta:
        model = Venda
        fields = '__all__'