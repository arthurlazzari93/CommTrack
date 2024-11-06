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
# Registre as demais ViewSets...

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]
