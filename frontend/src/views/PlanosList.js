import React, { useState, useEffect } from 'react';
import axios from 'axios';  
import { Table, Container, Row, Card, CardHeader, Col, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import Header from 'components/Headers/Header';

const PlanosList = () => {
  const [planos, setPlanos] = useState([]);
  const [selectedPlano, setSelectedPlano] = useState(null);
  const [comissoes, setComissoes] = useState({});
  
  const [newPlano, setNewPlano] = useState({
    operadora: '',
    tipo: '',
    comissionamento_total: '',
    numero_parcelas: ''
  });
  

  useEffect(() => {
    // Carregar todos os planos de uma vez
    axios.get('http://localhost:8000/api/plano/')
      .then((response) => {
        setPlanos(response.data);
      })
      .catch((error) => {
        console.error('Erro ao buscar planos', error);
      });
  
    // Carregar todas as comissões de uma vez e organizar no estado
// Carregar todas as parcelas (comissões) de uma vez e organizar no estado
axios.get('http://localhost:8000/api/parcela/')
  .then((response) => {
    const comissoesMap = {};
    response.data.forEach((parcela) => {
      comissoesMap[`${parcela.plano}-${parcela.numero_parcela}`] = {
        id: parcela.id,
        porcentagem_parcela: parcela.porcentagem_parcela
      };
    });
    setComissoes(comissoesMap);
  })
  .catch(error => console.error('Erro ao carregar parcelas:', error));

  }, []);
  
  
  
  
  
  const handleSaveComissao = (planoId, numero_parcela) => {
    const porcentagem_parcela = comissoes[`${planoId}-${numero_parcela}`]?.porcentagem_parcela || '0';
  
    if (comissoes[`${planoId}-${numero_parcela}`]?.id) {
      const parcelaId = comissoes[`${planoId}-${numero_parcela}`].id;
      axios.put(`http://localhost:8000/api/parcela/${parcelaId}/`, {
        plano: planoId,
        numero_parcela,
        porcentagem_parcela
      })
      .then(() => {
        console.log(`Parcela ${numero_parcela} do plano ${planoId} atualizada com sucesso.`);
      })
      .catch((error) => {
        console.error(`Erro ao atualizar a parcela ${numero_parcela} do plano ${planoId}:`, error);
      });
    } else {
      axios.post('http://localhost:8000/api/parcela/', {
        plano: planoId,
        numero_parcela,
        porcentagem_parcela
      })
      .then((response) => {
        console.log(`Nova parcela criada para o plano ${planoId}.`);
        setComissoes(prevComissoes => ({
          ...prevComissoes,
          [`${planoId}-${numero_parcela}`]: {
            id: response.data.id,
            porcentagem_parcela: porcentagem_parcela
          }
        }));
      })
      .catch((error) => {
        console.error(`Erro ao criar nova parcela para o plano ${planoId}:`, error);
      });
    }
  };
  
  
  
  

  const handleInputChangeComissao = (planoId, numero_parcela, porcentagem_parcela) => {
    setComissoes(prevComissoes => ({
      ...prevComissoes,
      [`${planoId}-${numero_parcela}`]: {
        ...prevComissoes[`${planoId}-${numero_parcela}`],
        porcentagem_parcela: porcentagem_parcela
      }
    }));
  };
  
  

  const handleSaveAllComissoes = (planoId) => {
    const totalParcelas = planos.find(plano => plano.id === planoId).parcelas_total;
  
    Array.from({ length: totalParcelas }).forEach((_, i) => {
      const numero_parcela = i + 1;
      const porcentagem_parcela = comissoes[`${planoId}-${numero_parcela}`]?.porcentagem_parcela || '0';
  
      if (comissoes[`${planoId}-${numero_parcela}`]?.id) {
        // Atualiza a comissão existente
        const comissaoId = comissoes[`${planoId}-${numero_parcela}`].id;
        axios.put(`http://localhost:8000/api/parcela/${comissaoId}/`, {
          plano: planoId,
          numero_parcela,
          porcentagem_parcela
        })
        .then(() => {
          console.log(`Parcela ${numero_parcela} do plano ${planoId} atualizada com sucesso.`);
        })
        .catch((error) => {
          console.error(`Erro ao atualizar a parcela ${numero_parcela} do plano ${planoId}:`, error);
        });
      } else {
        // Cria uma nova comissão para a parcela do plano
        axios.post('http://localhost:8000/api/parcela/', {
          plano: planoId,
          numero_parcela,
          porcentagem_parcela
        })
        .then((response) => {
          console.log(`Nova comissão criada para a parcela ${numero_parcela} do plano ${planoId}.`);
          setComissoes(prevComissoes => ({
            ...prevComissoes,
            [`${planoId}-${numero_parcela}`]: {
              id: response.data.id,
              porcentagem_parcela: porcentagem_parcela
            }
          }));
        })
        .catch((error) => {
          console.error(`Erro ao criar nova comissão para a parcela ${numero_parcela} do plano ${planoId}:`, error);
        });
      }
    });
  };
  
  
  
  
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (selectedPlano) {
      setSelectedPlano({ ...selectedPlano, [name]: value });
    } else {
      setNewPlano({ ...newPlano, [name]: value });
    }
  };
  

  const handleNewPlano = () => {
    setSelectedPlano(null);
    setNewPlano({
      nome_plano: '',
      tipo_plano: '',
      taxa_administrativa: '',
      parcelas_total: ''
    });
  };

  const handleDeletePlano = (id) => {
    axios.delete(`http://localhost:8000/api/plano/${id}/`)
      .then(() => {
        setPlanos(planos.filter(plano => plano.id !== id));
        setSelectedPlano(null);  // Limpa o formulário
      })
      .catch((error) => {
        console.error('Erro ao deletar plano', error);
      });
  };

  const handleSavePlano = (e) => {
    e.preventDefault();
  
    const planoData = selectedPlano ? selectedPlano : newPlano;
  
    if (selectedPlano) {
      axios.put(`http://localhost:8000/api/plano/${selectedPlano.id}/`, planoData)
        .then(() => {
          setPlanos(planos.map(plano => plano.id === selectedPlano.id ? selectedPlano : plano));
          setSelectedPlano(null);  // Limpa o formulário
        })
        .catch((error) => {
          console.error('Erro ao modificar plano', error);
        });
    } else {
      axios.post('http://localhost:8000/api/plano/', planoData)
        .then((response) => {
          setPlanos([...planos, response.data]);
          setNewPlano({
            operadora: '',
            tipo: '',
            comissionamento_total: '',
            numero_parcelas: ''
          });
        })
        .catch((error) => {
          console.error('Erro ao cadastrar plano', error);
        });
    }
  };
  
  

    
  

  return (
    <>
      <Header />
      <Container className="mt--7" fluid>
              {/* Linha do formulário de cadastro/edição de plano */}
      <Row>
      <Col>
    <Card className="bg-secondary shadow mb-4">
      <CardHeader className="border-0 d-flex justify-content-between align-items-center">
        <h3 className="mb-0">{selectedPlano ? 'Editar Plano' : 'Cadastrar Novo Plano'}</h3>
        {selectedPlano && (
          <Button color="info" onClick={handleNewPlano}>Novo Plano</Button>
        )}
      </CardHeader>
      <Form onSubmit={handleSavePlano} className="p-3">
  <Row>
    <Col md="3">
      <FormGroup>
        <Label for="operadora">Operadora</Label>
        <Input
          type="text"
          name="operadora"
          id="operadora"
          value={selectedPlano ? selectedPlano.operadora : newPlano.operadora}
          onChange={handleInputChange}
          placeholder="Operadora"
          required
        />
      </FormGroup>
    </Col>
    <Col md="3">
      <FormGroup>
        <Label for="tipo">Tipo do Plano</Label>
        <Input
          type="select"
          name="tipo"
          id="tipo"
          value={selectedPlano ? selectedPlano.tipo : newPlano.tipo}
          onChange={handleInputChange}
          required
        >
          <option value="">Selecione o tipo</option>
          <option value="PME">PME</option>
          <option value="PF">Pessoa Física</option>
          <option value="Adesão">Adesão</option>
        </Input>
      </FormGroup>
    </Col>
    <Col md="3">
      <FormGroup>
        <Label for="comissionamento_total">Comissionamento Total (%)</Label>
        <Input
          type="number"
          step="0.01"
          name="comissionamento_total"
          id="comissionamento_total"
          value={selectedPlano ? selectedPlano.comissionamento_total : newPlano.comissionamento_total}
          onChange={handleInputChange}
          placeholder="Comissionamento total"
          required
        />
      </FormGroup>
    </Col>
    <Col md="3">
      <FormGroup>
        <Label for="numero_parcelas">Número de Parcelas</Label>
        <Input
          type="number"
          name="numero_parcelas"
          id="numero_parcelas"
          value={selectedPlano ? selectedPlano.numero_parcelas : newPlano.numero_parcelas}
          onChange={handleInputChange}
          placeholder="Número de parcelas"
          required
        />
      </FormGroup>
    </Col>
  </Row>
  <Button type="submit" color="primary">
    {selectedPlano ? 'Modificar' : 'Cadastrar'}
  </Button>
  {selectedPlano && (
    <Button color="danger" className="ml-2" onClick={() => handleDeletePlano(selectedPlano.id)}>Deletar</Button>
  )}
</Form>

    </Card>
  </Col>
      </Row>

      {/* Linha da tabela de lista de planos */}
      <Row>
        <Col>
          <Card className="bg-default shadow">
            <CardHeader className="bg-transparent border-0">
              <h3 className="text-white mb-0">Lista de Planos</h3>
            </CardHeader>
            <Table className="align-items-center table-dark table-flush" responsive>
  <thead className="thead-dark">
    <tr>
      <th>Ações</th>
      <th>Operadora</th>
      <th>Tipo do Plano</th>
      <th>Comissionamento Total (%)</th>
      {/* Cabeçalhos das parcelas */}
      {Array.from({ length: Math.max(...planos.map(plano => plano.numero_parcelas)) }, (_, i) => (
        <th key={i}>Parcela {i + 1} (%)</th>
      ))}
    </tr>
  </thead>
  <tbody>
    {planos.map((plano) => (
      <tr key={plano.id}>
        <td>
          <Button color="info" onClick={() => setSelectedPlano(plano)} size="sm">Modificar</Button>
          
        </td>
        <td>{plano.operadora}</td>
        <td>{plano.tipo}</td>
        <td>{plano.comissionamento_total}</td>
        {/* Inputs das parcelas */}
        {Array.from({ length: plano.numero_parcelas }, (_, i) => (
          <td key={i}>
            <Input
              type="number"
              value={comissoes[`${plano.id}-${i + 1}`]?.porcentagem_parcela || ''}
              onChange={(e) => handleInputChangeComissao(plano.id, i + 1, e.target.value)}
              onBlur={() => handleSaveComissao(plano.id, i + 1)}
              placeholder="%"
            />
          </td>
        ))}
      </tr>
    ))}
  </tbody>
</Table>

          </Card>
        </Col>
      </Row>
      </Container>
    </>
  );
};

export default PlanosList;
