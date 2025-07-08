import { Stage, StageData } from './stages.interface'
import { handleServiceError } from '../../../core/errors/error.service';
import Container from '../../../core/dependencies/Container';
import EncryptionService from '../../../core/services/EncryptionService';
import StagesRepository from './StagesRepository';

export default class StagesService {
    private repository: StagesRepository;
    private block = "stages.service"
    constructor(repository: StagesRepository) {
        this.repository = repository
    }

    async create(stage: StageData): Promise<Stage> {
        const mappedStage = this.mapToDb(stage);
        try {
            return this.repository.create(mappedStage as Stage);
        } catch (error) {
            handleServiceError(error as Error, this.block, "create", mappedStage)
            throw error;
        }
    }

    async upsert(stages: StageData[]): Promise<Stage[]> {
        const mappedStages = stages.map((stage) => this.mapToDb(stage));

        const cols = Object.keys(mappedStages[0]).filter(key =>
            mappedStages.every(stage => (stage as any)[key] !== undefined)
        );

        const values = mappedStages.flatMap(stage =>
            cols.map(col => (stage as any)[col])
        );
        try {
            const result = await this.repository.upsert(cols, values);

            return result;
        } catch (error) {
            handleServiceError(error as Error, this.block, "upsert", {cols, values})
            throw error;
        }
    }

    async resource(stageId: string): Promise<StageData | null> {
        try {
            const result = await this.repository.selectOne("stage_id", stageId);
            if(!result) {
                return null
            }
            return this.mapFromDb(result)
        } catch (error) {
            handleServiceError(error as Error, this.block, "resource", {stageId})
            throw error;
        }
    }

    async collection(pipelineId: string): Promise<StageData[]> {
        try {
            const result = await this.repository.select("pipeline_id", pipelineId);
            
            return result.map((stage) => this.mapFromDb(stage));
        } catch (error) {
            handleServiceError(error as Error, this.block, "resource", {pipelineId})
            throw error;
        }
    }


    async update(stageId: string, changes: StageData): Promise<Stage> {
        const mappedChanges = this.mapToDb(changes);
        const cleanedChanges = Object.fromEntries(
            Object.entries(mappedChanges).filter(([_, value]) => value !== undefined)
        );
        try {
            return await this.repository.update("stage_id", stageId, cleanedChanges);
        } catch (error) {
            handleServiceError(error as Error, this.block, "update", cleanedChanges)
            throw error;
        }
    }

    async delete(stageId: string): Promise<Stage> {
        try {
            return await this.repository.delete("stage_id", stageId) as Stage;
        } catch (error) {
            handleServiceError(error as Error, this.block, "delete", {stageId})
            throw error;
        }
    }

    mapToDb(stage: StageData): Stage {
        const encryptionService = Container.resolve<EncryptionService>("EncryptionService");
        return {
            stage_id: stage.stageId,
            pipeline_id: stage.pipelineId,
            name: stage.name,
            position: stage.position && Number(stage.position),
            in_funnel_chart: stage.inFunnelChart,
            in_pie_chart: stage.inPieChart
        }
    }

    mapFromDb(stage: Stage): StageData {
        const encryptionService = Container.resolve<EncryptionService>("EncryptionService");
        return {
            stageId: stage.stage_id,
            pipelineId: stage.pipeline_id,
            name: stage.name,
            position: Number(stage.position),
            inFunnelChart: stage.in_funnel_chart,
            inPieChart: stage.in_pie_chart
        }
    }
}
