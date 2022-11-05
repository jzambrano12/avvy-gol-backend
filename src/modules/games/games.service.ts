import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class GamesService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getTodayGames(): Promise<unknown[]> {
    const URL = this.configService.get('API_BASE_URL');
    const RAPID_API_KEY = this.configService.get('RAPID_API_KEY');
    const RAPID_API_HOST = this.configService.get('RAPID_API_HOST');
    const CHAMPIONSHIP_ID = this.configService.get('CHAMPIONSHIP_ID');

    const todayDate = new Date()
      .toISOString()
      .split('T')[0]
      .replaceAll('-', '');

    const { data } = await firstValueFrom(
      this.httpService
        .get(`${URL}/matches/day/basic/`, {
          params: { d: todayDate, l: 'en_US' },
          headers: {
            'X-RapidAPI-Key': RAPID_API_KEY,
            'X-RapidAPI-Host': RAPID_API_HOST,
          },
        })
        .pipe(
          catchError((error: any) => {
            console.error(error.request);
            throw 'An error happened!';
          }),
        ),
    );

    return data.result.filter(
      (game) => game.championship.id === CHAMPIONSHIP_ID,
    );
  }
}
