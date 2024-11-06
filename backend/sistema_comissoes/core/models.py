from django.db import models
from django.utils import timezone
import datetime

class Cliente(models.Model):
    nome = models.CharField(max_length=255)
    telefone = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    endereco = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.nome

class Plano(models.Model):
    TIPO_CHOICES = (
        ('PME', 'PME'),
        ('PF', 'Pessoa Física'),
        ('Adesão', 'Adesão'),
    )

    operadora = models.CharField(max_length=255)
    comissionamento_total = models.DecimalField(max_digits=6, decimal_places=2)  # Ex: 300.00%
    tipo = models.CharField(max_length=50, choices=TIPO_CHOICES)
    numero_parcelas = models.PositiveIntegerField()

    class Meta:
        unique_together = ('operadora', 'tipo')

    def __str__(self):
        return f"{self.operadora} - {self.tipo}"


class Parcela(models.Model):
    plano = models.ForeignKey(Plano, on_delete=models.CASCADE)
    numero_parcela = models.PositiveIntegerField()
    porcentagem_parcela = models.DecimalField(max_digits=6, decimal_places=2)

    def __str__(self):
        return f"Parcela {self.numero_parcela} - Plano {self.plano.operadora}"

class Consultor(models.Model):
    nome = models.CharField(max_length=255)
    telefone = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)

    def __str__(self):
        return self.nome

class Venda(models.Model):
    numero_proposta = models.CharField(max_length=100, unique=True)
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE)
    plano = models.ForeignKey(Plano, on_delete=models.CASCADE)
    consultor = models.ForeignKey(Consultor, on_delete=models.CASCADE)
    valor_plano = models.DecimalField(max_digits=10, decimal_places=2)
    desconto_consultor = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    taxa_plano = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    data_venda = models.DateField(default=timezone.now)
    data_vigencia = models.DateField()
    data_vencimento = models.DateField()

    def valor_liquido(self):
        return self.valor_plano - self.desconto_consultor - self.taxa_plano

    def __str__(self):
        return f"Proposta {self.numero_proposta} - {self.cliente.nome}"

    def save(self, *args, **kwargs):
        super(Venda, self).save(*args, **kwargs)
        # Exclui controles de recebimento existentes para evitar duplicações
        self.controlederecebimento_set.all().delete()
        # Gera controles de recebimento correspondentes
        valor_liquido = self.valor_liquido()
        valor_plano_sem_descontos = self.valor_plano
        data_recebimento_inicial = self.data_venda  # Ou outra data definida

        parcelas = Parcela.objects.filter(plano=self.plano).order_by('numero_parcela')
        for parcela in parcelas:
            if parcela.numero_parcela == 1:
                valor_parcela = valor_liquido * (parcela.porcentagem_parcela / 100)
            else:
                valor_parcela = valor_plano_sem_descontos * (parcela.porcentagem_parcela / 100)
            data_prevista = data_recebimento_inicial + datetime.timedelta(days=30 * (parcela.numero_parcela - 1))
            ControleDeRecebimento.objects.create(
                venda=self,
                parcela=parcela,
                valor_parcela=valor_parcela,
                data_prevista_recebimento=data_prevista,
                status='Não Recebido'
            )

class ControleDeRecebimento(models.Model):
    STATUS_CHOICES = (
        ('Recebido', 'Recebido'),
        ('Não Recebido', 'Não Recebido'),
    )
    venda = models.ForeignKey(Venda, on_delete=models.CASCADE)
    parcela = models.ForeignKey(Parcela, on_delete=models.CASCADE)
    valor_parcela = models.DecimalField(max_digits=10, decimal_places=2)
    data_prevista_recebimento = models.DateField()
    data_recebimento = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Não Recebido')
    numero_extrato = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"Recebimento Parcela {self.parcela.numero_parcela} - Venda {self.venda.numero_proposta}"
