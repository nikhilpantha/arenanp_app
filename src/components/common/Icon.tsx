import { type ColorValue } from 'react-native';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Award,
  Ban,
  BarChart3,
  Bell,
  Building2,
  Calendar,
  CalendarDays,
  Camera,
  Car,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock,
  Coffee,
  CreditCard,
  DollarSign,
  Droplets,
  Dumbbell,
  Eye,
  EyeOff,
  Filter,
  Heart,
  Home,
  ImageIcon,
  Lightbulb,
  Lock,
  type LucideIcon,
  type LucideProps,
  Mail,
  MapPin,
  Minus,
  MoveRight,
  Music,
  Navigation,
  Package,
  Percent,
  Phone,
  Plus,
  Repeat,
  Search,
  Settings,
  Share2,
  ShieldCheck,
  ShowerHead,
  Star,
  TrendingUp,
  Trophy,
  User,
  Users,
  Wifi,
  Wrench,
  X,
  XCircle,
} from 'lucide-react-native';

import { useTheme } from '@/hooks/use-theme';

const ICONS = {
  activity: Activity,
  arrowLeft: ArrowLeft,
  arrowRight: ArrowRight,
  award: Award,
  ban: Ban,
  barChart: BarChart3,
  bell: Bell,
  building: Building2,
  calendar: Calendar,
  calendarDays: CalendarDays,
  camera: Camera,
  check: Check,
  chevronDown: ChevronDown,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  clock: Clock,
  creditCard: CreditCard,
  dollarSign: DollarSign,
  eye: Eye,
  eyeOff: EyeOff,
  filter: Filter,
  heart: Heart,
  helpCircle: CircleHelp,
  home: Home,
  image: ImageIcon,
  lock: Lock,
  mail: Mail,
  mapPin: MapPin,
  minus: Minus,
  moveRight: MoveRight,
  navigation: Navigation,
  package: Package,
  percent: Percent,
  phone: Phone,
  plus: Plus,
  repeat: Repeat,
  search: Search,
  settings: Settings,
  share: Share2,
  shield: ShieldCheck,
  star: Star,
  trendingUp: TrendingUp,
  trophy: Trophy,
  user: User,
  users: Users,
  wrench: Wrench,
  x: X,
  xCircle: XCircle,
  car: Car,
  coffee: Coffee,
  droplets: Droplets,
  dumbbell: Dumbbell,
  lightbulb: Lightbulb,
  music: Music,
  showerHead: ShowerHead,
  wifi: Wifi,
} as const satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

export interface IconProps extends Omit<LucideProps, 'color' | 'size'> {
  name: IconName;
  size?: number;
  color?: ColorValue;
  testID?: string;
}

export function Icon({ name, size = 24, color, testID, ...rest }: IconProps) {
  const theme = useTheme();
  const Component = ICONS[name as keyof typeof ICONS];
  if (!Component) {
    // runtime guard: unknown icon name
    // don't throw — log and render nothing
    // This prevents `Cannot read property 'displayName' of undefined` when ICONS[name] is missing
     
    console.warn(`[Icon] unknown icon name: ${String(name)}`);
    return null;
  }

  return <Component size={size} color={(color as string) ?? theme.ink} testID={testID} {...rest} />;
}
