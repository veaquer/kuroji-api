import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Query,
} from '@nestjs/common';
import { AnilistService } from '../service/anilist.service';
import { AnilistIndexerService } from '../service/anilist-indexer/anilist-indexer.service';
import { StreamService } from '../../stream/service/stream.service';
import { Provider } from '../../stream/model/Provider';
import { FilterDto } from '../filter/FilterDto';
import { AnilistAddService } from '../service/helper/anilist.add.service';
import { AnilistScheduleService } from '../service/helper/anilist.schedule.service';
import Dimens from '../../../../configs/Dimens';
import { AnilistSearchService } from '../service/helper/anilist.search.service';

@Controller('anime')
export class AnilistController {
  constructor(
    private readonly service: AnilistService,
    private readonly add: AnilistAddService,
    private readonly search: AnilistSearchService,
    private readonly schedule: AnilistScheduleService,
    private readonly stream: StreamService,
    private readonly indexer: AnilistIndexerService,
  ) {}

  @Get('info/:id')
  async getAnilist(@Param('id', ParseIntPipe) id: number) {
    return this.service.getAnilist(id);
  }

  @Get('info/:id/recommendations')
  async getRecommendations(
    @Param('id', ParseIntPipe) id: number,
    @Query() filter: FilterDto,
  ) {
    return this.add.getRecommendations(id, filter);
  }

  @Get('info/:id/characters')
  async getCharacters(
    @Param('id', ParseIntPipe) id: number,
    @Query('perPage') perPage: number = Dimens.PER_PAGE,
    @Query('page') page: number = 1,
  ) {
    return this.add.getCharacters(id, perPage, page);
  }

  @Get('info/:id/chronology')
  async getChronology(
    @Param('id', ParseIntPipe) id: number,
    @Query() filter: FilterDto,
  ) {
    return this.add.getChronology(id, filter);
  }

  @Get('info/:id/episodes')
  async getEpisodes(@Param('id', ParseIntPipe) id: number) {
    return this.stream.getEpisodes(id);
  }

  @Get('info/:id/providers/:number')
  async getProvidersSingle(
    @Param('id', ParseIntPipe) id: number,
    @Param('number', ParseIntPipe) number: number,
  ) {
    return this.stream.getProvidersSingle(id, number);
  }

  @Get('info/:id/providers')
  async getProvidersMultiple(@Param('id', ParseIntPipe) id: number) {
    return this.stream.getProvidersMultiple(id);
  }

  @Get('info/:id/episodes/:number')
  async getEpisode(
    @Param('id', ParseIntPipe) id: number,
    @Param('number', ParseIntPipe) number: number,
  ) {
    return this.stream.getEpisode(id, number);
  }

  @Get('watch/:id/episodes/:number')
  async getSources(
    @Param('id', ParseIntPipe) id: number,
    @Param('number', ParseIntPipe) number: number,
    @Query('provider') provider: string = Provider.ANIWATCH,
    @Query('dub') dub: boolean = false,
  ) {
    const providerEnum =
      Provider[provider.toUpperCase() as keyof typeof Provider] ||
      Provider.ANIWATCH;

    return this.stream.getSources(providerEnum, number, id, dub);
  }

  @Get('filter')
  async filterAnilist(@Query() filter: FilterDto) {
    return this.search.getAnilists(filter);
  }

  @Get('search/:q')
  async searchAnilist(@Param('q') q: string) {
    return this.search.searchAnilist(q);
  }

  @Get('schedule')
  async getSchedule() {
    return this.schedule.getSchedule();
  }

  @Get('random')
  async getRandom() {
    return this.add.getRandom();
  }

  @Get('franchise/:franchise')
  async getFranchise(
    @Param('franchise') franchise: string,
    @Query() filter: FilterDto,
  ) {
    return this.add.getFranchise(franchise, filter);
  }

  @Get('genres')
  async getGenres() {
    return this.add.getAllGenres();
  }

  @Get('tags')
  async getTags(
    @Query('perPage') perPage: number = Dimens.PER_PAGE,
    @Query('page') page: number = 1,
  ) {
    return this.add.getAllTags(page, perPage);
  }

  @Put('index')
  index(
    @Query('delay') delay: number = 10,
    @Query('range') range: number = 25,
  ) {
    this.indexer
      .index(delay, range)
      .catch((err) => console.error('Indexer failed:', err)); // just in case it blows up

    return {
      status: 'Indexing started',
    };
  }

  @Put('index/stop')
  async stopIndex() {
    this.indexer.stop();
    return {
      status: 'Indexing stopped',
    };
  }
}
