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

} from 'reactstrap';
import Header from 'components/Headers/Header';
import moment from 'moment';
import debounce from 'lodash.debounce';

const ControleRecebimentoPanel = () => {
  const [vendas, setVendas] = useState([]);
  const [openVendaIds, setOpenVendaIds] = useState([]);
  const [editingRecebimentos, setEditingRecebimentos] = useState({});

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

  const debouncedUpdateRecebimento = useCallback(
    debounce((recebimentoId, data) => {
      updateRecebimento(recebimentoId, data);
    }, 500),
    []
  );
  

  const handleInputChange = (recebimentoId, field, value) => {
    setEditingRecebimentos((prevState) => ({
      ...prevState,
      [recebimentoId]: {
        ...prevState[recebimentoId],
        [field]: value,
      },
    }));
  
    // Usar o debounce
    debouncedUpdateRecebimento(recebimentoId, { [field]: value });
  };

  const updateRecebimento = (recebimentoId, data) => {
    axios
      .patch(`http://localhost:8000/api/controlederecebimento/${recebimentoId}/`, data)
      .then((response) => {
        // Atualizar a venda no estado local
      // Atualiza a lista de vendas para refletir as mudanças
      fetchVendas();
    })
    .catch((error) => {
      console.error('Erro ao atualizar recebimento:', error);
    });
};

// ControleRecebimentoPanel.js

const calcularDiasAtraso = (dataPrevista, dataRecebimento) => {
    const dataPrevistaMoment = moment(dataPrevista);
    const dataRecebimentoMoment = dataRecebimento
      ? moment(dataRecebimento)
      : moment();
    const diff = dataRecebimentoMoment.diff(dataPrevistaMoment, 'days');
    return diff > 0 ? diff : 0;
  };
  
  

      const handleMarcarRecebida = (recebimentoId) => {
        axios
          .post(
            `http://localhost:8000/api/parcela/${recebimentoId}/marcar-recebida/`
          )
          .then(() => {
            // Atualiza a lista de vendas para refletir a mudança
            fetchVendas();
          })
          .catch((error) => {
            console.error('Erro ao marcar parcela como recebida:', error);
          });
      };
      
  
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
                  {vendas.length === 0 ? (
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
                        {vendas.map((venda) => (
                          <React.Fragment key={venda.id}>
                            <tr>
                              <td>{venda.numero_proposta}</td>
                              <td>{venda.cliente.nome}</td>
                              <td>{venda.valor_plano}</td>
                              <td>
                                {moment(venda.data_venda).format('DD/MM/YYYY')}
                              </td>
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
                                      {venda.parcelas_recebimento.map(
                                        (recebimento) => (
                                          <tr key={recebimento.id}>
                                            <td>
                                              {
                                                recebimento.parcela
                                                  .numero_parcela
                                              }
                                            </td>
                                            <td>{recebimento.valor_parcela}</td>
                                            <td>
                                              {moment(
                                                recebimento.data_prevista_recebimento
                                              ).format('DD/MM/YYYY')}
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
                                              recebimento.data_recebimento || ''
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
                                              recebimento.numero_extrato || ''
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
                                                    onClick={() => handleMarcarRecebida(recebimento.id)}>Marcar como Recebida
                                                </Button>
                                                )}
                                            </td>
                                          </tr>
                                        )
                                      )}
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
  