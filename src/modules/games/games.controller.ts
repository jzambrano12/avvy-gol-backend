import { HttpService } from '@nestjs/axios';
import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { catchError, firstValueFrom } from 'rxjs';

@Controller('games')
export class GamesController {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  @Get('today')
  async getTodayGames() {
    const URL = this.configService.get('API_BASE_URL');
    const RAPID_API_KEY = this.configService.get('RAPID_API_KEY');
    const RAPID_API_HOST = this.configService.get('RAPID_API_HOST');
    const { data } = await firstValueFrom(
      this.httpService
        .get(`${URL}/matches/day/basic/`, {
          params: { d: '20221105', l: 'en_US' },
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

    // New Zealand Football Championship ID
    return data.result.filter(
      (game) => game.championship.id === 'cd35a89d04982f5b',
    );
  }
}
