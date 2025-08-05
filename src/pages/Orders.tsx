import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Search, Filter, CheckCircle2, Clock, AlertTriangle, FileText, Edit, Eye, Download } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

const Orders = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("todas");
  const [filterSetor, setFilterSetor] = useState("todos");
  const [ordens, setOrdens] = useState([
    {
      id: 1,
      titulo: "Controle de Umidade - Setor A",
      descricao: "Verificação diária dos níveis de umidade no setor de produção A",
      status: "pendente",
      prioridade: "alta",
      setor: "Produção A",
      responsavel: "João Silva",
      criado: "2025-07-01",
      prazo: "2025-07-03",
      parametros: [{ nome: "Umidade", valor: "75%", limite: "60-80%", status: "ok" }]
    },
    {
      id: 2,
      titulo: "Verificação Temperatura Câmara Fria",
      descricao: "Monitoramento da temperatura nas câmaras de conservação",
      status: "concluida",
      prioridade: "critica",
      setor: "Estoque",
      responsavel: "Maria Santos",
      criado: "2025-07-01",
      prazo: "2025-07-02",
      parametros: [
        { nome: "Temperatura", valor: "4°C", limite: "2-6°C", status: "ok" },
        { nome: "Umidade", valor: "90%", limite: "85-95%", status: "ok" }
      ]
    },
    {
      id: 3,
      titulo: "Limpeza e Desinfecção",
      descricao: "Procedimento de higienização completa da área de produção",
      status: "atrasada",
      prioridade: "media",
      setor: "Produção B",
      responsavel: "Pedro Lima",
      criado: "2025-06-30",
      prazo: "2025-07-01",
      parametros: []
    },
    {
      id: 4,
      titulo: "Calibração de Equipamentos",
      descricao: "Verificação e calibração dos instrumentos de medição",
      status: "pendente",
      prioridade: "alta",
      setor: "Laboratório",
      responsavel: "Ana Costa",
      criado: "2025-07-02",
      prazo: "2025-07-04",
      parametros: [{ nome: "pH", valor: "6.8", limite: "6.0-7.0", status: "ok" }]
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluida': return 'bg-green-100 text-green-800 border-green-200';
      case 'pendente': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'atrasada': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (prioridade: string) => {
    switch (prioridade) {
      case 'critica': return 'bg-red-500 text-white';
      case 'alta': return 'bg-orange-500 text-white';
      case 'media': return 'bg-yellow-500 text-white';
      case 'baixa': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
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

  const filteredOrdens = ordens.filter(ordem => {
    const matchesSearch = ordem.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ordem.responsavel.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "todas" || ordem.status === filterStatus;
    const matchesSetor = filterSetor === "todos" || ordem.setor === filterSetor;
    
    return matchesSearch && matchesStatus && matchesSetor;
  });

  const ordensStats = {
    todas: ordens.length,
    pendentes: ordens.filter(o => o.status === 'pendente').length,
    concluidas: ordens.filter(o => o.status === 'concluida').length,
    atrasadas: ordens.filter(o => o.status === 'atrasada').length
  };

  const downloadOrdemPlanilha = (ordem: any) => {
    const dadosOrdem = [
      ['ORDEM DE SERVIÇO', ''],
      ['', ''],
      ['ID:', ordem.id],
      ['Título:', ordem.titulo],
      ['Descrição:', ordem.descricao],
      ['Status:', ordem.status.charAt(0).toUpperCase() + ordem.status.slice(1)],
      ['Prioridade:', ordem.prioridade.charAt(0).toUpperCase() + ordem.prioridade.slice(1)],
      ['Setor:', ordem.setor],
      ['Responsável:', ordem.responsavel],
      ['Data de Criação:', new Date(ordem.criado).toLocaleDateString('pt-BR')],
      ['Prazo:', new Date(ordem.prazo).toLocaleDateString('pt-BR')],
      ['Data de Conclusão:', new Date().toLocaleDateString('pt-BR')],
      ['', ''],
      ['PARÂMETROS MONITORADOS', ''],
      ['', '']
    ];

    if (ordem.parametros.length > 0) {
      dadosOrdem.push(['Parâmetro', 'Valor', 'Limite', 'Status']);
      ordem.parametros.forEach((param: any) => {
        dadosOrdem.push([param.nome, param.valor, param.limite, param.status]);
      });
    } else {
      dadosOrdem.push(['Nenhum parâmetro monitorado', '', '', '']);
    }

    const ws = XLSX.utils.aoa_to_sheet(dadosOrdem);
    const wb = XLSX.utils.book_new();
    
    ws['!cols'] = [
      { width: 25 },
      { width: 20 },
      { width: 15 },
      { width: 10 }
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Ordem de Serviço");
    const nomeArquivo = `OS_${ordem.id}_${ordem.titulo.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`;
    XLSX.writeFile(wb, nomeArquivo);
  };

  const handleConcluirOrdem = (ordemId: number) => {
    setOrdens(ordens.map(ordem => 
      ordem.id === ordemId 
        ? { ...ordem, status: 'concluida' }
        : ordem
    ));
    
    toast({
      title: "Ordem concluída!",
      description: "A ordem de serviço foi marcada como concluída.",
    });
  };

  const handleVisualizarOrdem = (ordemId: number) => {
    navigate(`/view-order/${ordemId}`);
  };

  const handleEditarOrdem = (ordemId: number) => {
    navigate(`/edit-order/${ordemId}`);
  };

  const renderOrderCard = (ordem: any) => (
    <Card key={ordem.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {getStatusIcon(ordem.status)}
              <h3 className="text-lg font-semibold text-gray-900">{ordem.titulo}</h3>
              <Badge className={getPriorityColor(ordem.prioridade)}>
                {ordem.prioridade.toUpperCase()}
              </Badge>
            </div>
            <p className="text-gray-600 mb-3">{ordem.descricao}</p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <span><strong>Setor:</strong> {ordem.setor}</span>
              <span><strong>Responsável:</strong> {ordem.responsavel}</span>
              <span><strong>Criado:</strong> {new Date(ordem.criado).toLocaleDateString('pt-BR')}</span>
              <span><strong>Prazo:</strong> {new Date(ordem.prazo).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Badge className={getStatusColor(ordem.status)}>
              {ordem.status.charAt(0).toUpperCase() + ordem.status.slice(1)}
            </Badge>
          </div>
        </div>

        {/* Parâmetros */}
        {ordem.parametros.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Parâmetros Monitorados:</h4>
            <div className="flex flex-wrap gap-2">
              {ordem.parametros.map((param: any, index: number) => (
                <div key={index} className="bg-green-50 border border-green-200 rounded px-3 py-1 text-sm">
                  <span className="font-medium">{param.nome}:</span> {param.valor} 
                  <span className="text-gray-500 ml-1">({param.limite})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="flex flex-col sm:flex-row justify-end gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full sm:w-auto"
            onClick={() => handleVisualizarOrdem(ordem.id)}
          >
            <Eye className="w-4 h-4 mr-1" />
            Visualizar
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full sm:w-auto"
            onClick={() => handleEditarOrdem(ordem.id)}
          >
            <Edit className="w-4 h-4 mr-1" />
            Editar
          </Button>
          {ordem.status === 'concluida' && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => downloadOrdemPlanilha(ordem)}
              className="w-full sm:w-auto bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
            >
              <Download className="w-4 h-4 mr-1" />
              Baixar Planilha
            </Button>
          )}
          {(ordem.status === 'pendente' || ordem.status === 'atrasada') && (
            <Button 
              size="sm" 
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
              onClick={() => handleConcluirOrdem(ordem.id)}
            >
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Concluir
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Ordens de Serviço</h1>
            <p className="text-sm text-gray-600">Gerencie e acompanhe todas as ordens de serviço</p>
          </div>
          <Link to="/create-os">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <FileText className="w-4 h-4 mr-2" />
              Nova OS
            </Button>
          </Link>
        </div>
      </header>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Filtros e Busca */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar por título ou responsável..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    <SelectItem value="pendente">Pendentes</SelectItem>
                    <SelectItem value="concluida">Concluídas</SelectItem>
                    <SelectItem value="atrasada">Atrasadas</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterSetor} onValueChange={setFilterSetor}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Setor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="Produção A">Produção A</SelectItem>
                    <SelectItem value="Produção B">Produção B</SelectItem>
                    <SelectItem value="Estoque">Estoque</SelectItem>
                    <SelectItem value="Laboratório">Laboratório</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs com Estatísticas */}
        <Tabs defaultValue="todas" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="todas" className="flex items-center gap-2">
              Todas ({ordensStats.todas})
            </TabsTrigger>
            <TabsTrigger value="pendentes" className="flex items-center gap-2">
              Pendentes ({ordensStats.pendentes})
            </TabsTrigger>
            <TabsTrigger value="concluidas" className="flex items-center gap-2">
              Concluídas ({ordensStats.concluidas})
            </TabsTrigger>
            <TabsTrigger value="atrasadas" className="flex items-center gap-2">
              Atrasadas ({ordensStats.atrasadas})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="todas" className="mt-6">
            <div className="space-y-4">
              {filteredOrdens.map((ordem) => renderOrderCard(ordem))}
            </div>
          </TabsContent>

          <TabsContent value="pendentes">
            <div className="space-y-4">
              {filteredOrdens.filter(o => o.status === 'pendente').map((ordem) => renderOrderCard(ordem))}
            </div>
          </TabsContent>

          <TabsContent value="concluidas">
            <div className="space-y-4">
              {filteredOrdens.filter(o => o.status === 'concluida').map((ordem) => renderOrderCard(ordem))}
            </div>
          </TabsContent>

          <TabsContent value="atrasadas">
            <div className="space-y-4">
              {filteredOrdens.filter(o => o.status === 'atrasada').map((ordem) => (
                <div key={ordem.id} className="border-l-4 border-l-red-500">
                  {renderOrderCard(ordem)}
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Orders;