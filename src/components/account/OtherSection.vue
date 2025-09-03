<script setup lang="ts">
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ref } from "vue";

const selectedCountry = ref("");

const countries = [
  { value: "us", label: "United States" },
  { value: "uk", label: "United Kingdom" },
  { value: "de", label: "Germany" },
  { value: "fr", label: "France" },
  { value: "es", label: "Spain" },
];
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- User Details Card -->
    <Card>
      <CardHeader>
        <CardTitle>Location & Contact</CardTitle>
        <CardDescription>
          Manage your regional and contact preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="grid gap-4">
          <div class="grid gap-2">
            <label
              class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              for="country"
            >
              Country
            </label>
            <Select v-model="selectedCountry">
              <SelectTrigger class="w-full">
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="country in countries"
                  :key="country.value"
                  :value="country.value"
                >
                  {{ country.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="grid gap-2">
            <label
              class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              for="timezone"
            >
              Timezone
            </label>
            <Input id="timezone" placeholder="e.g., America/New_York" />
          </div>
          <div class="grid gap-2">
            <label
              class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              for="phone"
            >
              Phone
            </label>
            <Input id="phone" type="tel" placeholder="Enter phone number" />
          </div>
        </div>
      </CardContent>
      <CardFooter class="border-t px-6 py-4">
        <Button>Save Changes</Button>
      </CardFooter>
    </Card>
  </div>
</template>
