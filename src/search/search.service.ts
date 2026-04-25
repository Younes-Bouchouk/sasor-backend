import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class SearchService {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async search(index: string, query: string) {
    const result = await this.elasticsearchService.search({
      index,
      body: {
        query: {
          multi_match: {
            query,
            fields: ['pseudo'],
            fuzziness: 'AUTO',
          },
        },
      },
    });

    return result.hits.hits.map((hit) => hit._source);
  }

  async index(index: string, document: any, id?: string) {
    return this.elasticsearchService.index({
      index,
      id,
      document,
    });
  }

  async update(index: string, id: string, doc: any) {
    return this.elasticsearchService.update({
      index,
      id,
      doc,
    });
  }

  async remove(index: string, id: string) {
    return this.elasticsearchService.delete({
      index,
      id,
    });
  }
}
