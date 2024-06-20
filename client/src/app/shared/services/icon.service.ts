import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class IconService {
  icons: Set<string> = new Set([]);

  catIcons: Map<string, string[]> = new Map();

  constructor() {
    this.setCategorizedIcons();
  }

  setCategorizedIcons() {
    this.catIcons.set('buildings', [
      'apartment',
      'domain',
      'home',
      'house',
      'cottage',
      'storefront',
      'store',
    ]);

    this.catIcons.set('nature', [
      'landscape',
      'yard',
      'nature',
      'nature_people',
      'pets',
      'agriculture',
      'local_florist',
    ]);

    this.catIcons.set('services', [
      'electrical_services',
      'local_fire_department',
      'smartphone',
      'receipt_long',
      'cloud',
      'subscriptions',
    ]);

    this.catIcons.set('activities', [
      'fitness_center',
      'sports_gymnastics',
      'sports_tennis',
      'hiking',
      'self_improvement',
      'kayaking',
      'downhill_skiing',
      'skateboarding',
      'sports_football',
      'scuba_diving',
      'rowing',
    ]);

    this.catIcons.set('money', [
      'attach_money',
      'credit_card',
      'ssid_chart',
      'show_chart',
      'savings',
      'redeem',
    ]);

    this.catIcons.set('food', [
      'menu_book',
      'restaurant',
      'lunch_dining',
      'cake',
      'local_cafe',
      'nightlife',
      'kitchen',
      'takeout_dining',
    ]);

    this.catIcons.set('health', [
      'health_and_safety',
      'monitor_heart',
      'emergency',
      'medical_information',
      'personal_injury',
      'medication_liquid',
    ]);

    this.catIcons.set('people', [
      'person',
      'account_circle',
      'group',
      'group_add',
      'groups',
      'person_add',
      'manage_accounts',
      'supervisor_account',
      'supervised_user_circle',
    ]);

    this.catIcons.set('shopping', [
      'checkroom',
      'luggage',
      'shopping_cart',
      'add_shopping_cart',
      'local_mall',
      'shopping_bag',
      'shopping_basket',
      'sell',
    ]);

    this.catIcons.set('other', [
      'more_horiz',
      'volunteer_activism',
      'construction',
      'swap_horiz',
      'settings',
      'key',
    ]);
  }
}
