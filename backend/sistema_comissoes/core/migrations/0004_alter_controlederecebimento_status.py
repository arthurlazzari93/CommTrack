# Generated by Django 5.1.3 on 2024-11-09 23:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0003_remove_venda_taxa_plano_plano_taxa_plano_tipo_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='controlederecebimento',
            name='status',
            field=models.CharField(choices=[('Recebido', 'Recebido'), ('Não Recebido', 'Não Recebido'), ('Atrasado', 'Atrasado')], default='Não Recebido', max_length=20),
        ),
    ]
