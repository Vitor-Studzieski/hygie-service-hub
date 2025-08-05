import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, Clock, AlertTriangle, Edit, Download } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import * as XLSX from 'xlsx';

const ViewOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ordem, setOrdem] = useState<any>(null);

  // Mock data - em produção viria do backend
  const ordens = [
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
  ];

  useEffect(() => {
    const foundOrdem = ordens.find(o => o.id === parseInt(id || '0'));
    setOrdem(foundOrdem);
  }, [id]);

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

  if (!ordem) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Ordem não encontrada</h1>
          <Link to="/orders">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Ordens
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <Link to="/orders">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Ordem de Serviço #{ordem.id}</h1>
            <p className="text-sm text-gray-600">Detalhes da ordem de serviço</p>
          </div>
          <div className="flex gap-2">
            <Link to={`/edit-order/${ordem.id}`}>
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
            </Link>
            {ordem.status === 'concluida' && (
              <Button 
                onClick={() => downloadOrdemPlanilha(ordem)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar Planilha
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="p-6 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {getStatusIcon(ordem.status)}
                  <CardTitle className="text-xl">{ordem.titulo}</CardTitle>
                  <Badge className={getPriorityColor(ordem.prioridade)}>
                    {ordem.prioridade.toUpperCase()}
                  </Badge>
                </div>
                <CardDescription className="text-base">
                  {ordem.descricao}
                </CardDescription>
              </div>
              <Badge className={getStatusColor(ordem.status)}>
                {ordem.status.charAt(0).toUpperCase() + ordem.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Informações Gerais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Informações Gerais</h3>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium text-gray-700">Setor:</span>
                    <span className="ml-2 text-gray-600">{ordem.setor}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Responsável:</span>
                    <span className="ml-2 text-gray-600">{ordem.responsavel}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Prioridade:</span>
                    <span className="ml-2">
                      <Badge className={getPriorityColor(ordem.prioridade)}>
                        {ordem.prioridade.charAt(0).toUpperCase() + ordem.prioridade.slice(1)}
                      </Badge>
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Cronograma</h3>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium text-gray-700">Data de Criação:</span>
                    <span className="ml-2 text-gray-600">{new Date(ordem.criado).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Prazo:</span>
                    <span className="ml-2 text-gray-600">{new Date(ordem.prazo).toLocaleDateString('pt-BR')}</span>
                  </div>
                  {ordem.status === 'concluida' && (
                    <div>
                      <span className="font-medium text-gray-700">Concluída em:</span>
                      <span className="ml-2 text-gray-600">{new Date().toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Parâmetros Monitorados */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Parâmetros Monitorados</h3>
              {ordem.parametros.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ordem.parametros.map((param: any, index: number) => (
                    <Card key={index} className="bg-green-50 border-green-200">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <h4 className="font-medium text-gray-900">{param.nome}</h4>
                          <p className="text-2xl font-bold text-green-600 my-2">{param.valor}</p>
                          <p className="text-sm text-gray-600">Limite: {param.limite}</p>
                          <Badge variant="secondary" className="mt-2">
                            {param.status === 'ok' ? 'Dentro do limite' : 'Fora do limite'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">Nenhum parâmetro foi configurado para esta ordem de serviço.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ViewOrder;