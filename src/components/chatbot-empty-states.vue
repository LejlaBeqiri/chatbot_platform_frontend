<template>
    <div class="chatbot_empty_state max-w-fit sm:max-w-lg rounded-xl  bg-card text-card-foreground shadow p-20 overflow-hidden">
        <img src="/bg/bg2.svg" class="empty_state_pattern">
        <template v-if="type == 'keys'">
            <div class="empty_state_icon">
                <KeyRound />
            </div>
            <h5 class="text-lg mb-2">No Environment Keys Found</h5>
            <p class="text-gray-500 text-sm text-primary">It looks like you haven't added any environment keys yet. Add
                your API keys and
                credentials to seamlessly connect your integrations.</p>
            <Button @click="emitClick('add')" class="mt-4">
                <KeyRound /> Add a key
            </Button>
        </template>
        <template v-if="type == 'knowledgebase'">
            <div class="empty_state_icon">
                <Book />
            </div>
            <h5 class="text-lg mb-2">No Knowledgebase Found</h5>
            <p class="text-gray-500 text-sm text-primary">It looks like you haven't added any AI knowledgebase articles
                yet. Add relevant knowledge to help your AI agent provide smarter, more accurate responses.</p>
            <Button @click="emitClick('add')" class="mt-4">
                <File /> Add knowledgebase
            </Button>
        </template>
        <template v-if="type == 'agents'">
            <div class="empty_state_icon">
                <Bot />
            </div>
            <h5 class="text-lg mb-2">No Agents Found</h5>
            <p class="text-gray-500 text-sm text-primary">It looks like you haven't added any Agents yet. Start adding
                your first Ai Agent to help your business chats with more accurate responses.</p>
            <Button @click="emitClick('add')" class="mt-4">
                <Plus /> New Agent
            </Button>
        </template>
    </div>
</template>

<script setup lang="ts">
interface Props {
    type?: string;
}

// Correctly define props with withDefaults
withDefaults(defineProps<Props>(), {
    type: "keys"
});

import { Button } from "@/components/ui/button";
import {
    Bot,
    Plus,
    KeyRound,
    Book,
    File,
} from "lucide-vue-next";

const emit = defineEmits(['add'])
const emitClick = (type: 'add') => {
    emit(type);
}

</script>

<style lang="scss" scoped>
.chatbot_empty_state {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 50px auto;
    text-align: center;
    position: relative;
    z-index: 0;


    .empty_state_icon {
        display: flex;
        flex-direction: row;
        align-items: center;
        padding: 15px;
        width: 86px;
        height: 86px;
        background: linear-gradient(180deg, #F9FAFB 0%, #EDF0F3 100%);
        border-radius: 200px;
        justify-content: center;
        margin-bottom: 50px;

    }

    h5,
    p,
    button {
        position: relative;
        z-index: 99;

    }


    h5 {
        font-weight: 600;

    }

    .empty_state_pattern {
        position: absolute;
        top: -104px;
        z-index: 0;
        width: 60%;
        opacity: 0.8;
    }
}

.is_products_empty {
    margin-top: 0 !important;
    max-width: initial !important;

    .empty_state_pattern {
        display: none !important
    }
}
</style>