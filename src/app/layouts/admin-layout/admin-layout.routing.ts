import { Routes } from '@angular/router';

import { CovidComponent } from '../../covid/covid.component';
import { LockdownComponent } from '../../lockdown/lockdown.component';
import { DeathRatesComponent } from '../../death-rates/death-rates.component';
// import { TypographyComponent } from '../../typography/typography.component';
// import { IconsComponent } from '../../icons/icons.component';
// import { NotificationsComponent } from '../../notifications/notifications.component';
// import { UpgradeComponent } from '../../upgrade/upgrade.component';

export const AdminLayoutRoutes: Routes = [
    { path: 'covid',      component: CovidComponent },
    { path: 'lockdown',   component: LockdownComponent },
    { path: 'deathrates',     component: DeathRatesComponent },
    // { path: 'typography',     component: TypographyComponent },
    // { path: 'icons',          component: IconsComponent },
    // { path: 'notifications',  component: NotificationsComponent },
    // { path: 'upgrade',        component: UpgradeComponent },
];
