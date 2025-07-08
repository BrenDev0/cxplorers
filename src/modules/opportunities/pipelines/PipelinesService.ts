import { Pipeline, PipelineData } from './pipelines.interface'
import BaseRepository from "../../../core/repository/BaseRepository";
import { handleServiceError } from '../../../core/errors/error.service';
import Container from '../../../core/dependencies/Container';
import EncryptionService from '../../../core/services/EncryptionService';

export default class PipelinesService {
    private repository: BaseRepository<Pipeline>;
    private block = "pipelines.service"
    constructor(repository: BaseRepository<Pipeline>) {
        this.repository = repository
    }

    async create(pipeline: Omit<PipelineData, "pipelineId">): Promise<Pipeline> {
        const mappedPipeline = this.mapToDb(pipeline);
        try {
            return this.repository.create(mappedPipeline as Pipeline);
        } catch (error) {
            handleServiceError(error as Error, this.block, "create", mappedPipeline)
            throw error;
        }
    }

    async resource(pipelineId: string): Promise<PipelineData | null> {
        try {
            const result = await this.repository.selectOne("pipeline_id", pipelineId);
            if(!result) {
                return null
            }
            return this.mapFromDb(result)
        } catch (error) {
            handleServiceError(error as Error, this.block, "resource", {pipelineId})
            throw error;
        }
    }

    async collection(businessId: string): Promise<PipelineData[]> {
        try {
            const result = await this.repository.select("business_id", businessId);
            
            return result.map((pipeline) => this.mapFromDb(pipeline))
        } catch (error) {
            handleServiceError(error as Error, this.block, "collection", {businessId})
            throw error;
        }
    }

    async update(pipelineId: string, changes: PipelineData): Promise<Pipeline> {
        const mappedChanges = this.mapToDb(changes);
        const cleanedChanges = Object.fromEntries(
            Object.entries(mappedChanges).filter(([_, value]) => value !== undefined)
        );
        console.log("mappedChanges::::", mappedChanges, " cleanedChanges:::::", cleanedChanges)
        try {
            return await this.repository.update("pipeline_id", pipelineId, cleanedChanges);
        } catch (error) {
            handleServiceError(error as Error, this.block, "update", cleanedChanges)
            throw error;
        }
    }

    async delete(pipelineId: string): Promise<Pipeline> {
        try {
            return await this.repository.delete("pipeline_id", pipelineId) as Pipeline;
        } catch (error) {
            handleServiceError(error as Error, this.block, "delete", {pipelineId})
            throw error;
        }
    }

    mapToDb(pipeline: Omit<PipelineData, "pipelineId">): Omit<Pipeline, "pipeline_id"> {
        const encryptionService = Container.resolve<EncryptionService>("EncryptionService");
        return {
           business_id: pipeline.businessId,
           in_funnel_chart: pipeline.inFunnelChart,
           in_pie_chart: pipeline.inPieChart,
           name: pipeline.name
        }
    }

    mapFromDb(pipeline: Pipeline): PipelineData {
        const encryptionService = Container.resolve<EncryptionService>("EncryptionService");
        return {
            pipelineId: pipeline.pipeline_id,
            businessId: pipeline.business_id,
            name: pipeline.name,
            inFunnelChart: pipeline.in_funnel_chart,
            inPieChart: pipeline.in_pie_chart,
            createdAt: pipeline.created_at
        }
    }
}
