"""traffic URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from backend import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('brushdata/', views.getBrushData),
    path('vmsp/', views.getVmsp),
    path('rank/', views.getRankpath),
    path('dayinfo/', views.getDayInfo),
    path('vorinfo/', views.getVorInfo),
    path('vordata/', views.getVorData),
    path('newrankdata/', views.getNewRank),
    path('tradetail/', views.getTraDetail),
    path('routecluster/', views.getRouteCluster),
    path('routeclusterbyuser/', views.getRouteClusterbyUser),
    path('routedetail/', views.getRouteDetail),
    path('criticalroute/', views.getCritialRoute)
]
