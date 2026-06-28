import type { Poem, Poet } from '../types';
import poemsRaw from './poems.json';

export const poems = poemsRaw as Poem[];

/**
 * Poet metadata. Lifespans are biographical facts; uncertain ones are hedged
 * with 约 / 生卒年不详 rather than invented. styles are conventional literary
 * characterizations. x/y are hand-placed star coordinates (normalized ~[-1,1]);
 * mag drives star brightness (1 = major poet). poems are joined from poems.json.
 */
type PoetMeta = Omit<Poet, 'poems' | 'mag' | 'luminosity'> & { mag?: Poet['mag'] };

const META: PoetMeta[] = [
  // ── 先秦 ──
  { name: '《诗经》', dynasty: '先秦', life: '约前11—前6世纪', year: -800, styles: ['风雅颂', '现实', '诗歌之源'], x: -0.18, y: 0.86, mag: 1 },
  { name: '屈原', dynasty: '先秦', life: '约前340 — 前278', year: -340, styles: ['浪漫', '香草美人', '楚辞之祖'], x: 0.28, y: 0.92, mag: 1 },

  // ── 唐 ──
  { name: '王勃', dynasty: '唐', life: '650 – 676', year: 650, styles: ['初唐四杰', '清新'], x: -0.62, y: 0.34 },
  { name: '张九龄', dynasty: '唐', life: '678 – 740', year: 678, styles: ['雅正', '盛唐气象'], x: -0.78, y: 0.06, mag: 2 },
  { name: '孟浩然', dynasty: '唐', life: '689 – 740', year: 689, styles: ['山水田园', '清淡自然'], x: -0.5, y: -0.12, mag: 2 },
  { name: '王维', dynasty: '唐', life: '701 – 761', year: 701, styles: ['山水田园', '诗中有画', '禅意'], x: 0.16, y: 0.38, mag: 1 },
  { name: '李白', dynasty: '唐', life: '701 – 762', year: 701, styles: ['浪漫主义', '豪放飘逸', '诗仙'], x: -0.46, y: 0.5, mag: 1 },
  { name: '王昌龄', dynasty: '唐', life: '698 – 757', year: 698, styles: ['边塞', '七绝圣手'], x: -0.74, y: -0.4, mag: 2 },
  { name: '杜甫', dynasty: '唐', life: '712 – 770', year: 712, styles: ['沉郁顿挫', '现实主义', '诗圣'], x: 0.02, y: 0.04, mag: 1 },
  { name: '岑参', dynasty: '唐', life: '约718 – 770', year: 718, styles: ['边塞', '雄奇瑰丽'], x: -0.34, y: -0.5, mag: 2 },
  { name: '张继', dynasty: '唐', life: '生卒年不详', year: 740, styles: ['羁旅', '清远'], x: -0.12, y: -0.66 },
  { name: '白居易', dynasty: '唐', life: '772 – 846', year: 772, styles: ['通俗平易', '讽喻写实'], x: 0.46, y: 0.16, mag: 2 },
  { name: '刘禹锡', dynasty: '唐', life: '772 – 842', year: 772, styles: ['咏史怀古', '刚健'], x: 0.62, y: -0.08 },
  { name: '柳宗元', dynasty: '唐', life: '773 – 819', year: 773, styles: ['山水', '清峻孤峭'], x: 0.36, y: -0.34, mag: 2 },
  { name: '杜牧', dynasty: '唐', life: '803 – 852', year: 803, styles: ['咏史', '俊爽风流'], x: 0.7, y: 0.3, mag: 2 },
  { name: '李商隐', dynasty: '唐', life: '813 – 858', year: 813, styles: ['朦胧绮丽', '深情', '无题'], x: 0.5, y: 0.5, mag: 1 },

  // ── 五代 ──
  { name: '李煜', dynasty: '五代', life: '937 – 978', year: 937, styles: ['亡国之音', '真挚深婉'], x: 0.86, y: 0.62, mag: 1 },

  // ── 宋 ──
  { name: '柳永', dynasty: '宋', life: '约984 – 约1053', year: 984, styles: ['婉约', '慢词', '市井'], x: -0.88, y: 0.46, mag: 2 },
  { name: '范仲淹', dynasty: '宋', life: '989 – 1052', year: 989, styles: ['沉雄', '边塞', '家国'], x: -0.7, y: 0.66 },
  { name: '晏殊', dynasty: '宋', life: '991 – 1055', year: 991, styles: ['婉约', '富贵闲雅'], x: -0.54, y: 0.82 },
  { name: '欧阳修', dynasty: '宋', life: '1007 – 1072', year: 1007, styles: ['婉约', '疏隽'], x: -0.3, y: 0.7, mag: 2 },
  { name: '王安石', dynasty: '宋', life: '1021 – 1086', year: 1021, styles: ['劲峭', '咏史'], x: -0.06, y: 0.58, mag: 2 },
  { name: '晏几道', dynasty: '宋', life: '约1038 – 约1110', year: 1038, styles: ['婉约', '深婉'], x: -0.42, y: 0.22 },
  { name: '苏轼', dynasty: '宋', life: '1037 – 1101', year: 1037, styles: ['豪放', '旷达', '全才'], x: 0.1, y: -0.16, mag: 1 },
  { name: '秦观', dynasty: '宋', life: '1049 – 1100', year: 1049, styles: ['婉约', '凄迷'], x: -0.2, y: -0.34 },
  { name: '李清照', dynasty: '宋', life: '1084 – 约1155', year: 1084, styles: ['婉约', '易安体', '词宗'], x: 0.28, y: -0.56, mag: 1 },
  { name: '岳飞', dynasty: '宋', life: '1103 – 1142', year: 1103, styles: ['豪放', '壮怀', '爱国'], x: -0.58, y: -0.62, mag: 2 },
  { name: '陆游', dynasty: '宋', life: '1125 – 1210', year: 1125, styles: ['爱国', '沉郁悲壮'], x: 0.56, y: -0.5, mag: 2 },
  { name: '辛弃疾', dynasty: '宋', life: '1140 – 1207', year: 1140, styles: ['豪放', '爱国', '词龙'], x: 0.66, y: -0.28, mag: 1 },
  { name: '姜夔', dynasty: '宋', life: '约1155 – 约1221', year: 1155, styles: ['格律', '清空骚雅'], x: 0.82, y: -0.06, mag: 2 },

  // ── 清 ──
  { name: '纳兰性德', dynasty: '清', life: '1655 – 1685', year: 1655, styles: ['哀感顽艳', '自然真切'], x: 0.9, y: -0.46, mag: 1 },
];

function build(): Poet[] {
  const byAuthor = new Map<string, Poem[]>();
  for (const p of poems) {
    const arr = byAuthor.get(p.author) ?? [];
    arr.push(p);
    byAuthor.set(p.author, arr);
  }
  return META.map((m) => {
    const ps = byAuthor.get(m.name) ?? [];
    const mag = (m.mag ?? 3) as Poet['mag'];
    // 诗海光度 = how many curated works (presence in the sea) + fame floor.
    const fame = mag === 1 ? 6 : mag === 2 ? 2.5 : 0;
    return { ...m, mag, poems: ps, luminosity: ps.length + fame };
  });
}

export const poets: Poet[] = build();
export const poetByName = new Map(poets.map((p) => [p.name, p]));

/** Dynasty order for the timeline. */
export const DYNASTIES = ['先秦', '汉', '魏晋', '唐', '宋', '元', '明', '清', '近代'];
