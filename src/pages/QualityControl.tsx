import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Save, Trash2, FileText, Calendar, User, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ControleQualidade {
  id?: string;
  mes: string;
  responsavel: string;
  assinatura?: string;
  codigo_doc?: string;
  elaborado_por?: string;
  elaborado_em?: string;
  revisado_por?: string;
  revisado_em?: string;
}

interface ItemControle {
  id?: string;
  data_recebimento: string;
  produto_recebido: string;
  status: 'C' | 'NC';
  quantidade?: number;
  fornecedor?: string;
  lote?: string;
  observacoes?: string;
}

const QualityControl = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("criar");
  const [controleForm, setControleForm] = useState<ControleQualidade>({
    mes: '',
    responsavel: '',
    assinatura: '',
    codigo_doc: '',
    elaborado_por: '',
    elaborado_em: '',
    revisado_por: '',
    revisado_em: ''
  });
  const [itens, setItens] = useState<ItemControle[]>([]);
  const [currentItem, setCurrentItem] = useState<ItemControle>({
    data_recebimento: '',
    produto_recebido: '',
    status: 'C',
    quantidade: 0,
    fornecedor: '',
    lote: '',
    observacoes: ''
  });
  const [controles, setControles] = useState<any[]>([]);
  const [selectedControleId, setSelectedControleId] = useState<string>('');

  useEffect(() => {
    loadControles();
  }, []);

  const loadControles = async () => {
    try {
      const { data, error } = await supabase
        .from('controle_qualidade')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setControles(data || []);
    } catch (error) {
      console.error('Erro ao carregar controles:', error);
    }
  };

  const loadItensControle = async (controleId: string) => {
    try {
      const { data, error } = await supabase
        .from('itens_controle')
        .select('*')
        .eq('controle_id', controleId)
        .order('data_recebimento', { ascending: false });

      if (error) throw error;
      // Filtrar e garantir que o status seja do tipo correto
      const formattedData = (data || []).map(item => ({
        ...item,
        status: (item.status === 'C' || item.status === 'NC') ? item.status : 'C'
      })) as ItemControle[];
      setItens(formattedData);
    } catch (error) {
      console.error('Erro ao carregar itens:', error);
    }
  };

  const handleAddItem = () => {
    if (!currentItem.data_recebimento || !currentItem.produto_recebido) {
      toast({
        title: "Erro",
        description: "Data de recebimento e produto são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setItens([...itens, { ...currentItem, id: Date.now().toString() }]);
    setCurrentItem({
      data_recebimento: '',
      produto_recebido: '',
      status: 'C',
      quantidade: 0,
      fornecedor: '',
      lote: '',
      observacoes: ''
    });

    toast({
      title: "Item adicionado",
      description: "Item adicionado à lista com sucesso"
    });
  };

  const handleRemoveItem = (index: number) => {
    setItens(itens.filter((_, i) => i !== index));
    toast({
      title: "Item removido",
      description: "Item removido da lista"
    });
  };

  const handleSaveControle = async () => {
    if (!controleForm.mes || !controleForm.responsavel) {
      toast({
        title: "Erro",
        description: "Mês e responsável são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      // Primeiro salva o controle de qualidade
      const { data: controleData, error: controleError } = await supabase
        .from('controle_qualidade')
        .insert([{
          ...controleForm,
          user_id: 'temp-user-id' // Temporário até implementar auth
        }])
        .select()
        .single();

      if (controleError) throw controleError;

      // Depois salva os itens
      if (itens.length > 0) {
        const itensToSave = itens.map(item => ({
          ...item,
          controle_id: controleData.id
        }));

        const { error: itensError } = await supabase
          .from('itens_controle')
          .insert(itensToSave);

        if (itensError) throw itensError;
      }

      toast({
        title: "Sucesso",
        description: "Controle de qualidade salvo com sucesso"
      });

      // Limpa os formulários
      setControleForm({
        mes: '',
        responsavel: '',
        assinatura: '',
        codigo_doc: '',
        elaborado_por: '',
        elaborado_em: '',
        revisado_por: '',
        revisado_em: ''
      });
      setItens([]);
      loadControles();

    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar controle de qualidade. Você precisa estar autenticado.",
        variant: "destructive"
      });
    }
  };

  const handleSelectControle = (controleId: string) => {
    setSelectedControleId(controleId);
    const controle = controles.find(c => c.id === controleId);
    if (controle) {
      setControleForm(controle);
      loadItensControle(controleId);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Controle de Qualidade</h1>
            <p className="text-sm text-muted-foreground">Gestão de recebimento de materiais, ingredientes e embalagens</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              <User className="w-4 h-4 mr-2" />
              Usuário: Admin
            </Button>
            <Button variant="outline" size="sm">
              <FileText className="w-4 h-4 mr-2" />
              Relatórios
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-7xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="criar">Criar Novo Controle</TabsTrigger>
            <TabsTrigger value="visualizar">Visualizar Controles</TabsTrigger>
          </TabsList>

          <TabsContent value="criar" className="space-y-6">
            {/* Informações do Controle */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Informações do Controle
                </CardTitle>
                <CardDescription>
                  Preencha as informações básicas do controle de qualidade
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="mes">Mês *</Label>
                    <Input
                      id="mes"
                      value={controleForm.mes}
                      onChange={(e) => setControleForm({...controleForm, mes: e.target.value})}
                      placeholder="Janeiro/2025"
                    />
                  </div>
                  <div>
                    <Label htmlFor="responsavel">Responsável *</Label>
                    <Input
                      id="responsavel"
                      value={controleForm.responsavel}
                      onChange={(e) => setControleForm({...controleForm, responsavel: e.target.value})}
                      placeholder="Nome do responsável"
                    />
                  </div>
                  <div>
                    <Label htmlFor="codigo_doc">Código do Documento</Label>
                    <Input
                      id="codigo_doc"
                      value={controleForm.codigo_doc}
                      onChange={(e) => setControleForm({...controleForm, codigo_doc: e.target.value})}
                      placeholder="DOC-001"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="elaborado_por">Elaborado por</Label>
                    <Input
                      id="elaborado_por"
                      value={controleForm.elaborado_por}
                      onChange={(e) => setControleForm({...controleForm, elaborado_por: e.target.value})}
                      placeholder="Nome do elaborador"
                    />
                  </div>
                  <div>
                    <Label htmlFor="elaborado_em">Data de elaboração</Label>
                    <Input
                      id="elaborado_em"
                      type="date"
                      value={controleForm.elaborado_em}
                      onChange={(e) => setControleForm({...controleForm, elaborado_em: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="revisado_por">Revisado por</Label>
                    <Input
                      id="revisado_por"
                      value={controleForm.revisado_por}
                      onChange={(e) => setControleForm({...controleForm, revisado_por: e.target.value})}
                      placeholder="Nome do revisor"
                    />
                  </div>
                  <div>
                    <Label htmlFor="revisado_em">Data de revisão</Label>
                    <Input
                      id="revisado_em"
                      type="date"
                      value={controleForm.revisado_em}
                      onChange={(e) => setControleForm({...controleForm, revisado_em: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="assinatura">Assinatura</Label>
                  <Input
                    id="assinatura"
                    value={controleForm.assinatura}
                    onChange={(e) => setControleForm({...controleForm, assinatura: e.target.value})}
                    placeholder="Assinatura digital ou nome"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Adicionar Item */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-primary" />
                  Adicionar Item de Controle
                </CardTitle>
                <CardDescription>
                  Adicione os itens recebidos para controle de qualidade
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="data_recebimento">Data de Recebimento *</Label>
                    <Input
                      id="data_recebimento"
                      type="date"
                      value={currentItem.data_recebimento}
                      onChange={(e) => setCurrentItem({...currentItem, data_recebimento: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="produto_recebido">Produto Recebido *</Label>
                    <Input
                      id="produto_recebido"
                      value={currentItem.produto_recebido}
                      onChange={(e) => setCurrentItem({...currentItem, produto_recebido: e.target.value})}
                      placeholder="Nome do produto"
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={currentItem.status} 
                      onValueChange={(value: 'C' | 'NC') => setCurrentItem({...currentItem, status: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="C">Conforme (C)</SelectItem>
                        <SelectItem value="NC">Não Conforme (NC)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="quantidade">Quantidade</Label>
                    <Input
                      id="quantidade"
                      type="number"
                      value={currentItem.quantidade}
                      onChange={(e) => setCurrentItem({...currentItem, quantidade: parseFloat(e.target.value)})}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fornecedor">Fornecedor</Label>
                    <Input
                      id="fornecedor"
                      value={currentItem.fornecedor}
                      onChange={(e) => setCurrentItem({...currentItem, fornecedor: e.target.value})}
                      placeholder="Nome do fornecedor"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lote">Lote</Label>
                    <Input
                      id="lote"
                      value={currentItem.lote}
                      onChange={(e) => setCurrentItem({...currentItem, lote: e.target.value})}
                      placeholder="Número do lote"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={currentItem.observacoes}
                    onChange={(e) => setCurrentItem({...currentItem, observacoes: e.target.value})}
                    placeholder="Observações sobre o item"
                    rows={3}
                  />
                </div>

                <Button onClick={handleAddItem} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Item
                </Button>
              </CardContent>
            </Card>

            {/* Lista de Itens */}
            {itens.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Itens Adicionados ({itens.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {itens.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${item.status === 'C' ? 'bg-green-500' : 'bg-red-500'}`} />
                          <div>
                            <h4 className="font-medium text-foreground">{item.produto_recebido}</h4>
                            <p className="text-sm text-muted-foreground">
                              {new Date(item.data_recebimento).toLocaleDateString('pt-BR')} - {item.fornecedor}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.status === 'C' 
                              ? 'bg-green-100 text-green-800 border border-green-200' 
                              : 'bg-red-100 text-red-800 border border-red-200'
                          }`}>
                            {item.status === 'C' ? 'Conforme' : 'Não Conforme'}
                          </span>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleRemoveItem(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6">
                    <Button onClick={handleSaveControle} className="w-full">
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Controle de Qualidade
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="visualizar" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  Controles Existentes
                </CardTitle>
                <CardDescription>
                  Visualize e gerencie os controles de qualidade criados
                </CardDescription>
              </CardHeader>
              <CardContent>
                {controles.length > 0 ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="select-controle">Selecionar Controle</Label>
                      <Select value={selectedControleId} onValueChange={handleSelectControle}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um controle de qualidade" />
                        </SelectTrigger>
                        <SelectContent>
                          {controles.map((controle) => (
                            <SelectItem key={controle.id} value={controle.id}>
                              {controle.mes} - {controle.responsavel} ({controle.codigo_doc || 'Sem código'})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedControleId && (
                      <div className="space-y-4">
                        <div className="p-4 bg-muted rounded-lg">
                          <h3 className="font-medium text-foreground mb-2">Informações do Controle</h3>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <p><strong>Mês:</strong> {controleForm.mes}</p>
                            <p><strong>Responsável:</strong> {controleForm.responsavel}</p>
                            <p><strong>Código:</strong> {controleForm.codigo_doc || 'N/A'}</p>
                            <p><strong>Elaborado por:</strong> {controleForm.elaborado_por || 'N/A'}</p>
                          </div>
                        </div>

                        {itens.length > 0 && (
                          <div>
                            <h3 className="font-medium text-foreground mb-2">Itens de Controle ({itens.length})</h3>
                            <div className="space-y-2">
                              {itens.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-3 border border-border rounded">
                                  <div>
                                    <p className="font-medium">{item.produto_recebido}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {new Date(item.data_recebimento).toLocaleDateString('pt-BR')} - {item.fornecedor}
                                    </p>
                                  </div>
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    item.status === 'C' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {item.status === 'C' ? 'Conforme' : 'Não Conforme'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Nenhum controle de qualidade encontrado</p>
                    <p className="text-sm text-muted-foreground">Crie um novo controle na aba "Criar Novo Controle"</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default QualityControl;