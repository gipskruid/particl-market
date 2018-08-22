// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import * as resources from 'resources';
import { SmsgMessageCreateRequest } from '../requests/SmsgMessageCreateRequest';
import { MarketplaceMessage } from '../messages/MarketplaceMessage';
import { MessageException } from '../exceptions/MessageException';
import { EscrowMessageType } from '../enums/EscrowMessageType';
import { BidMessageType } from '../enums/BidMessageType';
import { VoteMessageType } from '../enums/VoteMessageType';
import { ListingItemMessageType } from '../enums/ListingItemMessageType';
import { ProposalMessageType } from '../enums/ProposalMessageType';
import { SmsgMessageStatus } from '../enums/SmsgMessageStatus';

export class SmsgMessageFactory {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async get(message: resources.SmsgMessage): Promise<SmsgMessageCreateRequest> {

        return await this.parseJSONSafe(message.text)
            .then( marketplaceMessage => {

                const type = this.getType(marketplaceMessage);
                const status = SmsgMessageStatus.NEW;

                const createRequest = {
                    type,
                    status,
                    msgid: message.msgid,
                    version: message.version,
                    received: message.received,
                    sent: message.sent,
                    expiration: message.expiration,
                    daysRetention: message.daysRetention,
                    from: message.from,
                    to: message.to,
                    text: message.text
                } as SmsgMessageCreateRequest;

                return createRequest;
            })
            .catch(reason => {
                const type = 'UNKNOWN';
                const status = SmsgMessageStatus.PARSING_FAILED;

                const createRequest = {
                    type,
                    status,
                    msgid: message.msgid,
                    version: message.version,
                    received: message.received,
                    sent: message.sent,
                    expiration: message.expiration,
                    daysRetention: message.daysRetention,
                    from: message.from,
                    to: message.to,
                    text: message.text
                } as SmsgMessageCreateRequest;

                return createRequest;
            });
    }

    private async parseJSONSafe(json: string): Promise<MarketplaceMessage> {
        let parsed: MarketplaceMessage;
        try {
            // this.log.debug('json to parse:', json);
            parsed = JSON.parse(json);
        } catch (e) {
            this.log.warn('parseJSONSafe, invalid JSON:', json);
            throw new MessageException('Could not parse the incoming message.');
        }
        return parsed;
    }

    private getType(marketplaceMessage: MarketplaceMessage):
        EscrowMessageType | BidMessageType | ListingItemMessageType | ProposalMessageType | VoteMessageType | string {

        if (marketplaceMessage.item) {
            // in case of ListingItemMessage
            // todo: later we need to add support for other ListingItemMessageTypes
            // todo: actually the structure of ListingItemMessage should be the same as others
            return ListingItemMessageType.MP_ITEM_ADD;
        } else if (marketplaceMessage.mpaction) {
            // in case of ActionMessage
            return marketplaceMessage.mpaction.action;
        } else {
            // json object, but not something that we're expecting
            this.log.warn('Unexpected message, unable to get MessageType: ', JSON.stringify(marketplaceMessage, null, 2));
            throw new MessageException('Could not get the message type.');
        }
    }

}
