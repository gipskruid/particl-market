import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../core/api/Validate';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { ItemCategoryService } from '../services/ItemCategoryService';
import { RpcRequest } from '../requests/RpcRequest';
import { ItemCategory } from '../models/ItemCategory';
import {RpcCommand} from './RpcCommand';

export class CategoryFindCommand implements RpcCommand<Bookshelf.Collection<ItemCategory>> {

    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ItemCategoryService) private itemCategoryService: ItemCategoryService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'findcategory';
    }

    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<Bookshelf.Collection<ItemCategory>> {
        return await this.itemCategoryService.findByName(data.params[0]);
    }

    public help(): string {
        return 'CategoryFindCommand: TODO: Fill in help string.';
    }
}