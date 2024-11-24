// src/views/index.js

import React, { useState, useEffect, useCallback } from "react";
import classnames from "classnames";
import "variables/charts.js";
import { Line, Bar, Pie, Doughnut } from "react-chartjs-2";
import {
  //Button,
  Card,
  CardHeader,
  CardBody,
  NavItem,
  NavLink,
  Nav,
  //Progress,
  Container,
  Row,
  Col,
  Spinner,
  Alert,
} from "reactstrap";
import {
  chartOptions,
  getLineChartData,
  getBarChartData,
  getPieChartData,
  getDoughnutChartData,
} from "variables/charts.js";
import Header from "components/Headers/Header.js";
import api from "../api";
import { parseISO } from "date-fns";
import debounce from "lodash.debounce";

const Index = (props) => {
  const [activeNav, setActiveNav] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para armazenar os dados do dashboard
  const [lineChartData, setLineChartData] = useState({});
  const [barChartData, setBarChartData] = useState({});
  const [pieChartData, setPieChartData] = useState({});
  const [doughnutChartData, setDoughnutChartData] = useState({});

  // Estado para armazenar as vendas
  const [vendas, setVendas] = useState([]);

  // Estados para busca (opcional, já que não há seções de busca nas tabelas)
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Função para buscar dados do dashboard
  const fetchDashboardData = async () => {
    try {
      const [
        vendasRes,
        consultoresRes,
        planosRes,
        recebimentosRes,
      ] = await Promise.all([
        api.get("api/venda/"),
        api.get("api/consultor/"),
        api.get("api/plano/"),
        api.get("api/controlederecebimento/"),
      ]);

      const vendasData = vendasRes.data;
      const consultores = consultoresRes.data;
      const planos = planosRes.data;
      const recebimentos = recebimentosRes.data;

      // Atualizar o estado de vendas
      setVendas(vendasData);

      // Processar dados para o Gráfico de Linha (Total de Vendas ao Longo do Tempo)
      const meses = [
        "Janeiro",
        "Fevereiro",
        "Março",
        "Abril",
        "Maio",
        "Junho",
        "Julho",
        "Agosto",
        "Setembro",
        "Outubro",
        "Novembro",
        "Dezembro",
      ];

      const vendasPorMes = meses.map((mes, index) => {
        const total = vendasData.filter(
          (venda) => parseISO(venda.data_venda).getMonth() === index
        ).length;
        return total;
      });

      setLineChartData(getLineChartData(meses, vendasPorMes));

      // Processar dados para o Gráfico de Barras (Vendas por Consultor)
      const vendasPorConsultor = consultores.map((consultor) => {
        const total = vendasData.filter(
          (venda) => venda.consultor.id === consultor.id
        ).length;
        return total;
      });

      setBarChartData(
        getBarChartData(consultores.map((c) => c.nome), vendasPorConsultor)
      );

      // Processar dados para o Gráfico de Pizza (Vendas por Plano)
      const vendasPorPlano = planos.map((plano) => {
        const total = vendasData.filter(
          (venda) => venda.plano.id === plano.id
        ).length;
        return total;
      });

      setPieChartData(
        getPieChartData(
          planos.map((p) => `${p.operadora} - ${p.tipo}`),
          vendasPorPlano
        )
      );

      // Processar dados para o Gráfico de Donut (Recebimentos por Status)
      const statusCounts = recebimentos.reduce((acc, recebimento) => {
        const status = recebimento.status;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      setDoughnutChartData(
        getDoughnutChartData(Object.keys(statusCounts), Object.values(statusCounts))
      );

      setError(null);
    } catch (err) {
      console.error("Erro ao buscar dados do dashboard:", err);
      setError(
        "Erro ao carregar dados do dashboard. Por favor, tente novamente mais tarde."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounce para otimizar a busca (opcional, já que as tabelas de busca foram removidas)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((value) => {
      setDebouncedSearchTerm(value);
    }, 300),
    []
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    debouncedSearch(e.target.value);
  };

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Função para alternar entre mês e semana no gráfico de linha
  const toggleNavs = (e, index) => {
    e.preventDefault();
    setActiveNav(index);
    if (index === 1) {
      // Configurar dados para mês
      fetchDashboardData(); // Recarregar os dados
    } else if (index === 2) {
      // Configurar dados para semana
      // Implementar lógica para agregação semanal
      const semanas = ["Semana 1", "Semana 2", "Semana 3", "Semana 4"];
      // Agregar vendas por semana (simplificação)
      const vendasPorSemana = semanas.map((semana, indexSem) => {
        const now = new Date();
        const start = new Date(now);
        start.setDate(now.getDate() - now.getDay() - 7 * (3 - indexSem));
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(start.getDate() + 7);
        const total = vendas.filter((venda) => {
          const data = parseISO(venda.data_venda);
          return data >= start && data < end;
        }).length;
        return total;
      });

      setLineChartData(getLineChartData(semanas, vendasPorSemana));
    }
  };

  return (
    <>
      <Header />
      {/* Page content */}
      <Container className="mt--7" fluid>
        {loading ? (
          <Row className="justify-content-center">
            <Spinner color="primary" />
            <p className="text-center mt-3">Carregando dashboard...</p>
          </Row>
        ) : (
          <>
            {error && (
              <Row>
                <Col>
                  <Alert color="danger">{error}</Alert>
                </Col>
              </Row>
            )}
            <Row>
              <Col className="mb-5 mb-xl-0" xl="8">
                <Card className="bg-gradient-default shadow">
                  <CardHeader className="bg-transparent">
                    <Row className="align-items-center">
                      <div className="col">
                        <h6 className="text-uppercase text-light ls-1 mb-1">
                          Overview
                        </h6>
                        <h2 className="text-white mb-0">Sales value</h2>
                      </div>
                      <div className="col">
                        <Nav className="justify-content-end" pills>
                          <NavItem>
                            <NavLink
                              className={classnames("py-2 px-3", {
                                active: activeNav === 1,
                              })}
                              href="#pablo"
                              onClick={(e) => toggleNavs(e, 1)}
                            >
                              <span className="d-none d-md-block">Month</span>
                              <span className="d-md-none">M</span>
                            </NavLink>
                          </NavItem>
                          <NavItem>
                            <NavLink
                              className={classnames("py-2 px-3", {
                                active: activeNav === 2,
                              })}
                              data-toggle="tab"
                              href="#pablo"
                              onClick={(e) => toggleNavs(e, 2)}
                            >
                              <span className="d-none d-md-block">Week</span>
                              <span className="d-md-none">W</span>
                            </NavLink>
                          </NavItem>
                        </Nav>
                      </div>
                    </Row>
                  </CardHeader>
                  <CardBody>
                    {/* Chart */}
                    <div className="chart">
                      <Line
                        data={lineChartData}
                        options={chartOptions}
                        getDatasetAtEvent={(e) => console.log(e)}
                      />
                    </div>
                  </CardBody>
                </Card>
              </Col>
              <Col xl="4">
                <Card className="shadow">
                  <CardHeader className="bg-transparent">
                    <Row className="align-items-center">
                      <div className="col">
                        <h6 className="text-uppercase text-muted ls-1 mb-1">
                          Performance
                        </h6>
                        <h2 className="mb-0">Total orders</h2>
                      </div>
                    </Row>
                  </CardHeader>
                  <CardBody>
                    {/* Chart */}
                    <div className="chart">
                      <Bar data={barChartData} options={chartOptions} />
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>

            {/* Adicionando Novos Gráficos */}
            <Row className="mt-5">
              <Col xl="6">
                <Card className="shadow">
                  <CardHeader className="border-0">
                    <Row className="align-items-center">
                      <div className="col">
                        <h3 className="mb-0">Vendas por Plano</h3>
                      </div>
                    </Row>
                  </CardHeader>
                  <CardBody>
                    <Pie data={pieChartData} options={chartOptions} />
                  </CardBody>
                </Card>
              </Col>
              <Col xl="6">
                <Card className="shadow">
                  <CardHeader className="border-0">
                    <Row className="align-items-center">
                      <div className="col">
                        <h3 className="mb-0">Recebimentos por Status</h3>
                      </div>
                    </Row>
                  </CardHeader>
                  <CardBody>
                    <Doughnut data={doughnutChartData} options={chartOptions} />
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </>
        )}
      </Container>
    </>
  );
};

export default Index;
