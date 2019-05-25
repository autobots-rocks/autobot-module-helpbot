import { Command, CommandBase, CommandParser, DB, Event, Logger } from '@autobot/common';
import { RichEmbed }                                              from 'discord.js';
import { HelpBotQuestion }                                        from '../DB/HelpBotQuestion';
import { HelpBotTag }                                             from '../DB/HelpBotTag';

/**
 * Search the HelpDesk questions.
 *
 * Example: !search #javascript #js
 *
 */
@Command
export class SearchCommand extends CommandBase {

    public constructor() {

        //
        // Set this commands configuration.
        //
        super({

            event: Event.MESSAGE,
            name: '!search',
            group: 'help',
            description: 'Search the HelpDesk questions.',
            entities: [ HelpBotQuestion, HelpBotTag ]

        });

    }

    //
    // Called when a command matches config.name.
    //
    public async run(command: CommandParser) {

        //
        // First we try to detect for thank you and thanks.
        //
        let question: HelpBotQuestion = new HelpBotQuestion();

        question.fromUserid = command.obj.author.id;
        question.fromDiscriminator = command.obj.author.discriminator;
        question.fromUsername = command.obj.author.username;
        question.question = command.obj.content;
        question.tags = [];

        const tags = command.obj.content.match(/#([a-z0-9]+)/gi);

        if (tags && tags.length > 0) {

            for (let i = 0; i < tags.length; i++) {

                const tag = await DB.connection.getRepository(HelpBotTag)
                                    .createQueryBuilder('t')
                                    .select([ '*' ])
                                    .where('name = :name', { name: tags[ i ].replace('#', '') })
                                    .getRawOne();

                question.tags.push(tag);

            }

        }

        const result = await DB.connection.manager.save(question);

        command.obj.reply(new RichEmbed().setTitle('Ask New Question').setDescription(`Your question has ben submitted! Here is your ticket number: #${ result.id }`));

        Logger.log(`AskCommand.run: ${ JSON.stringify(result) }`);

    }

}