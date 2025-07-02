
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle2, Clock, FileText, Settings, Users, Calendar, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  // Mock data - em produção viria do backend
  const stats = {
    osTotal: 45,
    osPendentes: 12,
    osConcluidas: 28,
    osAtrasadas: 5,
    alertasAtivos: 3,
    conformidade: 89
  };

  const osRecentes = [
    { id: 1, titulo: "Controle de Umidade - Setor A", status: "pendente", prazo: "2025-07-03", responsavel: "João Silva" },
    { id: 2, titulo: "Verificação Temperatura Câmara Fria", status: "concluida", prazo: "2025-07-02", responsavel: "Maria Santos" },
    { id: 3, titulo: "Limpeza e Desinfecção", status: "atrasada", prazo: "2025-07-01", responsavel: "Pedro Lima" },
    { id: 4, titulo: "Calibração Equipamentos", status: "pendente", prazo: "2025-07-04", responsavel: "Ana Costa" }
  ];

  const alertas = [
    { id: 1, tipo: "Temperatura", valor: "28.5°C", limite: "25°C", setor: "Produção A" },
    { id: 2, tipo: "Umidade", valor: "85%", limite: "80%", setor: "Estoque" },
    { id: 3, tipo: "pH", valor: "4.2", limite: "5.0 - 7.0", setor: "Laboratório" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluida': return 'bg-green-100 text-green-800 border-green-200';
      case 'pendente': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'atrasada': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'concluida': return <CheckCircle2 className="w-4 h-4" />;
      case 'pendente': return <Clock className="w-4 h-4" />;
      case 'atrasada': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sistema OS Ativa</h1>
            <p className="text-sm text-gray-600">Plataforma de Gestão de Qualidade e Conformidade</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              <Users className="w-4 h-4 mr-2" />
              Usuário: Admin
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total de OS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.osTotal}</div>
              <p className="text-xs text-gray-500 mt-1">Este mês</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.osPendentes}</div>
              <p className="text-xs text-gray-500 mt-1">Aguardando execução</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Concluídas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.osConcluidas}</div>
              <p className="text-xs text-gray-500 mt-1">No prazo</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500 hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Em Atraso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.osAtrasadas}</div>
              <p className="text-xs text-gray-500 mt-1">Requer atenção</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Conformidade Geral */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Conformidade Geral
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-3xl font-bold text-green-600">{stats.conformidade}%</div>
                <Progress value={stats.conformidade} className="h-2" />
                <p className="text-sm text-gray-600">Meta: 95% | Atual: {stats.conformidade}%</p>
              </div>
            </CardContent>
          </Card>

          {/* Alertas Ativos */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Alertas Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alertas.slice(0, 2).map((alerta) => (
                  <div key={alerta.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-red-800">{alerta.tipo}</p>
                        <p className="text-sm text-red-600">{alerta.setor}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-red-800">{alerta.valor}</p>
                        <p className="text-xs text-red-600">Limite: {alerta.limite}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full">
                  Ver Todos os Alertas
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Ações Rápidas */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link to="/create-os">
                  <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700">
                    <FileText className="w-4 h-4 mr-2" />
                    Nova Ordem de Serviço
                  </Button>
                </Link>
                <Link to="/parameters">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    Configurar Parâmetros
                  </Button>
                </Link>
                <Link to="/reports">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    Gerar Relatório Mensal
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ordens de Serviço Recentes */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Ordens de Serviço Recentes</CardTitle>
            <CardDescription>Acompanhe o status das suas OS mais recentes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {osRecentes.map((os) => (
                <div key={os.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(os.status)}
                    <div>
                      <h4 className="font-medium text-gray-900">{os.titulo}</h4>
                      <p className="text-sm text-gray-600">Responsável: {os.responsavel}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Prazo</p>
                      <p className="text-sm font-medium">{new Date(os.prazo).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <Badge className={getStatusColor(os.status)}>
                      {os.status.charAt(0).toUpperCase() + os.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link to="/orders">
                <Button variant="outline">Ver Todas as Ordens de Serviço</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
