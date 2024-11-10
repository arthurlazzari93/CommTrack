from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from core import views

router = routers.DefaultRouter()
router.register(r'clientes', views.ClienteViewSet)
router.register(r'consultor', views.ConsultorViewSet)
router.register(r'controlederecebimento', views.ControleDeRecebimentoViewSet)
router.register(r'parcela', views.ParcelaViewSet)
router.register(r'plano', views.PlanoViewSet)
router.register(r'venda', views.VendaViewSet)

# Registre as demais ViewSets...

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('parcelas-atrasadas/', views.ParcelasAtrasadasList.as_view(), name='parcelas-atrasadas'),
    path('parcelas/<int:pk>/marcar-recebida/', views.marcar_parcela_recebida, name='marcar-parcela-recebida'),
    path('', include(router.urls)),

]
