import { TickerDto } from './../../../../common/dtos/ticker.model';
import { Subscriber } from 'rxjs/Subscriber';
import { Observable } from 'rxjs/Observable';
import { Component, Get, Req } from '@nestjs/common';
import { RxHttpRequest } from 'rx-http-request';
import { ApiWrapper } from './api.wrapper';
import { Exchange } from '../../../../common/enums/exchange';

@Component()
export class BittrexWrapper extends ApiWrapper {

    publicEndpoint: string = `https://bittrex.com/api/v1.1/public/`;
    exchange: Exchange = Exchange.bittrex;

    getTicker(): Observable<TickerDto[]> {
        const assetPairsUrl = this.composeUrl(`getmarketsummaries`);
        return RxHttpRequest.get(assetPairsUrl, {})
            .map((data) => {
                if (data.response.statusCode === 200) {
                    const pairs: TickerDto[] = [];
                    const body = data.response.body.json().result;
                    body.forEach((key, index) => {
                        pairs.push({
                            exchange: this.exchange,
                            symbol: key.MarketName,
                            last: key.Last,
                            ask: key.Ask,
                            bid: key.Bid,
                            percentChange: +Number((key.PrevDay - key.Last) / key.PrevDay).toFixed(8),
                            base: key.MarketName.split(`-`)[1],
                            quote: key.MarketName.split(`-`)[0],
                            volume: key.BaseVolume,
                            high: key.High,
                            low: key.Low,
                            updated: Date.now(),
                        });
                    });
                    return pairs;
                } else {
                    // TODO: error handling
                    return [];
                }
            })
    }


}