import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Table,
  Container,
  Row,
  Card,
  CardHeader,
  CardBody,
  Col,
  Collapse,
  Button,
  Input,
  FormGroup,
  Label,
  Form,
} from 'reactstrap';
import Header from 'components/Headers/Header';
import { format, differenceInDays, parseISO } from 'date-fns';
import debounce from 'lodash.debounce';

const ControleRecebimentoPanel = () => {
  const [vendas, setVendas] = useState([]);
  const [openVendaIds, setOpenVendaIds] = useState([]);
  const [editingRecebimentos, setEditingRecebimentos] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useEffect(() => {
    fetchVendas();
  }, []);

  const fetchVendas = () => {
    axios
      .get('http://localhost:8000/api/venda/')
      .then((response) => {
        setVendas(response.data);
      })
      .catch((error) => {
        console.error('Erro ao buscar vendas:', error);
      });
  };

  const toggleCollapse = (vendaId) => {
    setOpenVendaIds((prevState) =>
      prevState.includes(vendaId)
        ? prevState.filter((id) => id !== vendaId)
        : [...prevState, vendaId]
    );
  };

  const updateRecebimento = useCallback((recebimentoId, data) => {
    axios
      .patch(`http://localhost:8000/api/controlederecebimento/${recebimentoId}/`, data)
      .then((response) => {
        const updatedRecebimento = response.data;
        setVendas((prevVendas) =>
          prevVendas.map((venda) => {
            const hasRecebimento = venda.parcelas_recebimento.some(
              (parcela) => parcela.id === updatedRecebimento.id
            );
            if (hasRecebimento) {
              const updatedParcelas = venda.parcelas_recebimento.map((parcela) =>
                parcela.id === updatedRecebimento.id ? updatedRecebimento : parcela
              );
              return {
                ...venda,
                parcelas_recebimento: updatedParcelas,
              };
            }
            return venda;
          })
        );
        // Limpar o estado de edição
        setEditingRecebimentos((prevState) => {
          const newState = { ...prevState };
          delete newState[recebimentoId];
          return newState;
        });
      })
      .catch((error) => {
        console.error('Erro ao atualizar recebimento:', error);
      });
  }, []);
  
  const debouncedUpdateRecebimento = useCallback(
    debounce((recebimentoId, data) => {
      updateRecebimento(recebimentoId, data);
    }, 500),
    [updateRecebimento]
  );
    

  const handleInputChange = (recebimentoId, field, value) => {
    setEditingRecebimentos((prevState) => ({
      ...prevState,
      [recebimentoId]: {
        ...prevState[recebimentoId],
        [field]: value,
      },
    }));

    debouncedUpdateRecebimento(recebimentoId, { [field]: value });
  };

  const calcularDiasAtraso = (dataPrevista, dataRecebimento) => {
    const dataPrevistaDate = parseISO(dataPrevista);
    const dataRecebimentoDate = dataRecebimento ? parseISO(dataRecebimento) : new Date();
    const diff = differenceInDays(dataRecebimentoDate, dataPrevistaDate);
    return diff > 0 ? diff : 0;
  };

  const handleMarcarRecebida = (recebimentoId) => {
    axios
      .patch(`http://localhost:8000/api/controlederecebimento/${recebimentoId}/`, {
        status: 'Recebido',
      })
      .then((response) => {
        const updatedRecebimento = response.data;
        setVendas((prevVendas) =>
          prevVendas.map((venda) => {
            const hasRecebimento = venda.parcelas_recebimento.some(
              (parcela) => parcela.id === updatedRecebimento.id
            );
            if (hasRecebimento) {
              const updatedParcelas = venda.parcelas_recebimento.map((parcela) =>
                parcela.id === updatedRecebimento.id ? updatedRecebimento : parcela
              );
              return {
                ...venda,
                parcelas_recebimento: updatedParcelas,
              };
            }
            return venda;
          })
        );
      })
      .catch((error) => {
        console.error('Erro ao marcar parcela como recebida:', error);
      });
  };
  

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Função para lidar com a mudança no campo de pesquisa com debounce
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    debouncedSearch(e.target.value);
  };

  const debouncedSearch = useCallback(
    debounce((value) => {
      setDebouncedSearchTerm(value);
    }, 300),
    []
  );

  useEffect(() => {
    return () => {
      // Cancelar o debounce ao desmontar o componente
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Função para filtrar as vendas
  const filteredVendas = vendas.filter((venda) => {
    const numeroPropostaMatch = venda.numero_proposta
      .toLowerCase()
      .includes(debouncedSearchTerm.toLowerCase());
    const clienteNomeMatch = venda.cliente.nome
      .toLowerCase()
      .includes(debouncedSearchTerm.toLowerCase());

    return numeroPropostaMatch || clienteNomeMatch;
  });

  return (
    <>
      <Header />
      <Container className="mt--7" fluid>
        <Row>
          <Col>
            <Card className="shadow">
              <CardHeader className="border-0">
                <h3 className="mb-0">Controle de Recebimento de Comissões</h3>
              </CardHeader>
              <CardBody>
                <Form>
                  <FormGroup>
                    <Label for="search">Pesquisar Vendas:</Label>
                    <Input
                      type="text"
                      name="search"
                      id="search"
                      placeholder="Digite o número da proposta ou nome do cliente"
                      value={searchTerm}
                      onChange={handleSearchChange}
                    />
                  </FormGroup>
                </Form>
                {filteredVendas.length === 0 ? (
                  <p>Nenhuma venda encontrada.</p>
                ) : (
                  <Table responsive>
                    <thead>
                      <tr>
                        <th>Número da Proposta</th>
                        <th>Cliente</th>
                        <th>Valor do Plano</th>
                        <th>Data da Venda</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredVendas.map((venda) => (
                        <React.Fragment key={venda.id}>
                          <tr>
                            <td>{venda.numero_proposta}</td>
                            <td>{venda.cliente.nome}</td>
                            <td>{formatCurrency(venda.valor_plano)}</td>
                            <td>{format(parseISO(venda.data_venda), 'dd/MM/yyyy')}</td>
                            <td>
                              <Button
                                color="info"
                                size="sm"
                                onClick={() => toggleCollapse(venda.id)}
                              >
                                {openVendaIds.includes(venda.id)
                                  ? 'Esconder Parcelas'
                                  : 'Mostrar Parcelas'}
                              </Button>
                            </td>
                          </tr>
                          <tr>
                            <td colSpan="5" style={{ padding: 0 }}>
                              <Collapse isOpen={openVendaIds.includes(venda.id)}>
                                <Table size="sm" responsive>
                                  <thead>
                                    <tr>
                                      <th>Número da Parcela</th>
                                      <th>Valor da Parcela</th>
                                      <th>Data Prevista de Recebimento</th>
                                      <th>Dias de Atraso</th>
                                      <th>Data Real de Recebimento</th>
                                      <th>Número do Extrato</th>
                                      <th>Status</th>
                                      <th>Ações</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {venda.parcelas_recebimento.map((recebimento) => (
                                      <tr key={recebimento.id}>
                                        <td>{recebimento.parcela.numero_parcela}</td>
                                        <td>{formatCurrency(recebimento.valor_parcela)}</td>
                                        <td>
                                          {format(
                                            parseISO(recebimento.data_prevista_recebimento),
                                            'dd/MM/yyyy'
                                          )}
                                        </td>
                                        <td>
                                          {(() => {
                                            const diasAtraso = calcularDiasAtraso(
                                              recebimento.data_prevista_recebimento,
                                              recebimento.data_recebimento
                                            );
                                            return diasAtraso > 0 ? `${diasAtraso} dias` : '-';
                                          })()}
                                        </td>
                                        <td>
                                          <Input
                                            type="date"
                                            value={
                                              editingRecebimentos[recebimento.id]?.data_recebimento ||
                                              recebimento.data_recebimento ||
                                              ''
                                            }
                                            onChange={(e) =>
                                              handleInputChange(
                                                recebimento.id,
                                                'data_recebimento',
                                                e.target.value
                                              )
                                            }
                                          />
                                        </td>
                                        <td>
                                          <Input
                                            type="text"
                                            value={
                                              editingRecebimentos[recebimento.id]?.numero_extrato ||
                                              recebimento.numero_extrato ||
                                              ''
                                            }
                                            onChange={(e) =>
                                              handleInputChange(
                                                recebimento.id,
                                                'numero_extrato',
                                                e.target.value
                                              )
                                            }
                                          />
                                        </td>
                                        <td>{recebimento.status}</td>
                                        <td>
                                          {recebimento.status !== 'Recebido' && (
                                            <Button
                                              color="success"
                                              size="sm"
                                              onClick={() => handleMarcarRecebida(recebimento.id)}
                                            >
                                              Marcar como Recebida
                                            </Button>
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </Table>
                              </Collapse>
                            </td>
                          </tr>
                        </React.Fragment>
                      ))}
                    </tbody>
                  </Table>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default ControleRecebimentoPanel;
