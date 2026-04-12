import { describe, it, expect } from 'vitest';
import { produtoMapper } from '../produto-mapper';

describe('produto-mapper', () => {
  describe('fromApiToListItem', () => {
    it('deve mapear resposta da API para ListItem', () => {
      const apiResponse = {
        id: 1,
        sku: 'PROD-001',
        nome: 'Produto A',
        categoria_id: 1,
        categoria_nome: 'Eletrônicos',
        preco_venda: 100,
        quantidade: 10,
        ativo: true,
      };

      const result = produtoMapper.fromApiToListItem(apiResponse);

      expect(result.id).toBe(1);
      expect(result.codigo).toBe('PROD-001');
      expect(result.nome).toBe('Produto A');
      expect(result.estoque_atual).toBe(10);
      expect(result.preco_venda).toBe(100);
    });

    it('deve usar código vazio se sku não fornecido', () => {
      const apiResponse = {
        id: 1,
        sku: null,
        nome: 'Produto A',
        categoria_id: 1,
        categoria_nome: 'Eletrônicos',
        preco_venda: 100,
        quantidade: 10,
        ativo: true,
      };

      const result = produtoMapper.fromApiToListItem(apiResponse);

      expect(result.codigo).toBe('');
    });

    it('deve usar 0 para estoque se não fornecido', () => {
      const apiResponse = {
        id: 1,
        sku: 'PROD-001',
        nome: 'Produto A',
        categoria_id: 1,
        categoria_nome: 'Eletrônicos',
        preco_venda: 100,
        quantidade: null,
        ativo: true,
      };

      const result = produtoMapper.fromApiToListItem(apiResponse);

      expect(result.estoque_atual).toBe(0);
    });
  });

  describe('fromApiToDetalhe', () => {
    it('deve mapear resposta da API para Detalhe', () => {
      const apiResponse = {
        id: 1,
        sku: 'PROD-001',
        nome: 'Produto A',
        categoria_id: 1,
        categoria_nome: 'Eletrônicos',
        preco_venda: 100,
        preco_custo: 50,
        quantidade: 10,
        estoque_minimo: 5,
        descricao: 'Descrição do produto',
        marca: 'Marca A',
        unidade: 'UN',
        ativo: true,
        imagem_path: '/images/produto.jpg',
      };

      const result = produtoMapper.fromApiToDetalhe(apiResponse);

      expect(result.id).toBe(1);
      expect(result.codigo).toBe('PROD-001');
      expect(result.nome).toBe('Produto A');
      expect(result.estoque_minimo).toBe(5);
      expect(result.preco_custo).toBe(50);
      expect(result.descricao).toBe('Descrição do produto');
      expect(result.marca).toBe('Marca A');
    });

    it('deve usar valores padrão para campos opcionais', () => {
      const apiResponse = {
        id: 1,
        sku: 'PROD-001',
        nome: 'Produto A',
        categoria_id: 1,
        categoria_nome: 'Eletrônicos',
        preco_venda: 100,
        quantidade: 10,
        ativo: true,
      };

      const result = produtoMapper.fromApiToDetalhe(apiResponse);

      expect(result.estoque_minimo).toBe(0);
      expect(result.preco_custo).toBe(0);
      expect(result.unidade).toBe('UN');
      expect(result.descricao).toBeNull();
      expect(result.marca).toBeNull();
    });
  });

  describe('fromInputToApi', () => {
    it('deve mapear input para formato da API', () => {
      const input = {
        codigo: 'PROD-001',
        nome: 'Novo Produto',
        categoria_id: 1,
        preco_venda: 100,
        estoque_atual: 10,
        estoque_minimo: 5,
        ativo: true,
      };

      const result = produtoMapper.fromInputToApi(input);

      expect(result.sku).toBe('PROD-001');
      expect(result.nome).toBe('Novo Produto');
      expect(result.category_id).toBe(1);
      expect(result.preco_venda).toBe(100);
      expect(result.quantidade).toBe(10);
    });

    it('deve usar 0 para preco_custo se não fornecido', () => {
      const input = {
        codigo: 'PROD-001',
        nome: 'Novo Produto',
        categoria_id: 1,
        preco_venda: 100,
        estoque_atual: 10,
        estoque_minimo: 5,
        ativo: true,
      };

      const result = produtoMapper.fromInputToApi(input);

      expect(result.preco_custo).toBe(0);
    });

    it('deve usar null para campos opcionais não fornecidos', () => {
      const input = {
        codigo: 'PROD-001',
        nome: 'Novo Produto',
        categoria_id: 1,
        preco_venda: 100,
        estoque_atual: 10,
        estoque_minimo: 5,
        ativo: true,
      };

      const result = produtoMapper.fromInputToApi(input);

      expect(result.descricao).toBeNull();
      expect(result.marca).toBeNull();
      expect(result.codigo_barras).toBeNull();
    });
  });

  describe('fromApiListToEntities', () => {
    it('deve mapear lista de produtos', () => {
      const apiList = [
        {
          id: 1,
          sku: 'PROD-001',
          nome: 'Produto A',
          categoria_id: 1,
          categoria_nome: 'Eletrônicos',
          preco_venda: 100,
          quantidade: 10,
          ativo: true,
        },
        {
          id: 2,
          sku: 'PROD-002',
          nome: 'Produto B',
          categoria_id: 2,
          categoria_nome: 'Roupas',
          preco_venda: 50,
          quantidade: 20,
          ativo: true,
        },
      ];

      const result = produtoMapper.fromApiListToEntities(apiList);

      expect(result).toHaveLength(2);
      expect(result[0].nome).toBe('Produto A');
      expect(result[1].nome).toBe('Produto B');
    });

    it('deve retornar lista vazia se entrada é vazia', () => {
      const result = produtoMapper.fromApiListToEntities([]);

      expect(result).toHaveLength(0);
    });
  });
});
