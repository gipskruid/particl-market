import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ItemImageService } from '../../services/ItemImageService';
import { RpcRequest } from '../../requests/RpcRequest';
import {RpcCommand} from '../RpcCommand';

export class ItemImageDestroyCommand implements RpcCommand<void> {

    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ItemImageService) private itemImageService: ItemImageService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'itemimage.destroy';
    }

    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<void> {
        return this.itemImageService.destroy(data.params[0]);
    }

    public help(): string {
        return 'ItemImageDestroyCommand: TODO: Fill in help string.';
    }
}