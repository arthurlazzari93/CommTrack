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
    # Campos de leitura (read-only)
    cliente = ClienteSerializer(read_only=True)
    plano = PlanoSerializer(read_only=True)
    consultor = ConsultorSerializer(read_only=True)
    
    # Campos de escrita (write-only)
    cliente_id = serializers.PrimaryKeyRelatedField(queryset=Cliente.objects.all(), write_only=True, source='cliente')
    plano_id = serializers.PrimaryKeyRelatedField(queryset=Plano.objects.all(), write_only=True, source='plano')
    consultor_id = serializers.PrimaryKeyRelatedField(queryset=Consultor.objects.all(), write_only=True, source='consultor')
    
    parcelas_recebimento = ControleDeRecebimentoSerializer(source='controlederecebimento_set', many=True, read_only=True)

    class Meta:
        model = Venda
        fields = '__all__'

    def create(self, validated_data):
        # Extraia os campos relacionados
        cliente = validated_data.pop('cliente')
        plano = validated_data.pop('plano')
        consultor = validated_data.pop('consultor')

        # Crie a instância da Venda
        venda = Venda.objects.create(
            cliente=cliente,
            plano=plano,
            consultor=consultor,
            **validated_data
        )

        # Retorne a instância criada
        return venda


