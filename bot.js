// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityTypes } = require('botbuilder');
const { DialogSet, ChoicePrompt, WaterfallDialog } = require('botbuilder-dialogs');

const MENU_PROMPT = 'menuPrompt';
const MENU_DIALOG = 'menuDialog';
const DIALOG_STATE_PROPERTY = 'dialogState';

class MyBot {
    constructor(conversationState) {
        this.conversationState = conversationState;

        // Configure dialogs
        this.dialogState = this.conversationState.createProperty(DIALOG_STATE_PROPERTY);
        this.dialogs = new DialogSet(this.dialogState);
        this.dialogs.add(new ChoicePrompt(MENU_PROMPT));

        // Adds a waterfall dialog that prompts users for the top level menu to the dialog set
        this.dialogs.add(new WaterfallDialog(MENU_DIALOG, [
            this.promptForMenu,
            this.handleMenuResult,
            this.resetDialog,
        ]));
    }

    /**
     * This function gets called on every conversation 'turn' (whenever your bot receives an activity). If the bot receives a
     * Message, it determines where in our dialog we are and continues the dialog accordingly. If the bot receives a
     * ConversationUpdate (received when the user and bot join the conversation) it sends a welcome message and starts the
     * menu dialog.
     * @param turnContext The context of a specific turn. Includes the incoming activity as well as several helpers for sending
     * messages and handling conversations.
     */
    async onTurn(turnContext) {
        const dialogContext = await this.dialogs.createContext(turnContext);

        if (turnContext.activity.type === ActivityTypes.Message) {
            if (dialogContext.activeDialog) {
                await dialogContext.continueDialog();
            } else {
                await dialogContext.beginDialog(MENU_DIALOG);
            }
        } else if (turnContext.activity.type === ActivityTypes.ConversationUpdate) {
            if (this.memberJoined(turnContext.activity)) {
                await turnContext.sendActivity(`Hey there! I'm the ASH Music Festival Bot. I'm here to guide you around the festival!`);
                await dialogContext.beginDialog(MENU_DIALOG);
            }
        }
        await this.conversationState.saveChanges(turnContext);
    }

    /**
     * The first function in our waterfall dialog prompts the user with two options, 'Donate Food' and 'Food Bank'.
     * It uses the ChoicePrompt added in the contructor and referenced by the MENU_PROMPT string. The array of
     * strings passed in as choices will be rendered as suggestedAction buttons which the user can then click. If the
     * user types anything other than the button text, the choice prompt will reject it and reprompt using the retryPrompt
     * string.
     * @param step Waterfall dialog step
     */
    async promptForMenu(step) {
        return step.prompt(MENU_PROMPT, {
            choices: ["FAQs", "Band Search", "Navigate"],
          prompt: "How would you like to explore the event?",
            retryPrompt: "That's not valid response. Please click one of the buttons"
        });
    }

    /**
     * This step handles the result from the menu prompt above. It begins the appropriate dialog based on which button
     * was clicked.
     * @param step Waterfall Dialog Step
     */
    async handleMenuResult(step) {
        switch (step.result.value) {
            case "FAQs":
                return step.context.sendActivity("FAQs");
            case "Band Search":
                return step.context.sendActivity("Band Search");
            case "Navigate":
                return step.context.sendActivity("Navigate");
        }
        return step.next();
    }

    /**
     * This final step in our waterfall dialog replaces the dialog with itself, effectively starting the conversation over. This is often referred to as a 'message loop'.
     * @param step Waterfall Dialog Step
     */
    async resetDialog(step) {
        return step.replaceDialog(MENU_DIALOG);
    }

    /**
     * @param activity Incoming conversationUpdate activity
     * @returns Returns true if a new user is added to the conversation, which is useful for determining when to welcome a user. 
     */
    memberJoined(activity) {
        return ((activity.membersAdded.length !== 0 && (activity.membersAdded[0].id !== activity.recipient.id)));
    }
}

module.exports.MyBot = MyBot;
