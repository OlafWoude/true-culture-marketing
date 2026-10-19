import type { BlockType, Section } from "@/lib/cms/blocks";
import type { RenderCtx } from "@/lib/cms/render";
import {
  CasesBlock,
  ServicesDetailedBlock,
  ServicesOverviewBlock,
  TestimonialsBlock,
} from "./collections";
import {
  ClosingCtaBlock,
  ComparisonBlock,
  ContactDetailsBlock,
  FaqBlock,
  ImageBlock,
  ImageTextBlock,
  IntroSplitBlock,
  MarqueeBlock,
  NumberedCardsBlock,
  RichTextBlock,
  StepsBlock,
  StepsDetailedBlock,
  StorySplitBlock,
  TextCardsBlock,
  ValuesGridBlock,
} from "./content";
import { ContactHeroBlock, HeroBlock, PageHeroBlock } from "./heroes";
import { asBg, type BlockProps, type Bg, type SpaceTop } from "./shared";

const renderers: Record<BlockType, (props: BlockProps) => React.ReactNode> = {
  hero: HeroBlock,
  pageHero: PageHeroBlock,
  marquee: MarqueeBlock,
  introSplit: IntroSplitBlock,
  servicesOverview: ServicesOverviewBlock,
  servicesDetailed: ServicesDetailedBlock,
  comparison: ComparisonBlock,
  steps: StepsBlock,
  stepsDetailed: StepsDetailedBlock,
  cases: CasesBlock,
  faq: FaqBlock,
  closingCta: ClosingCtaBlock,
  storySplit: StorySplitBlock,
  valuesGrid: ValuesGridBlock,
  contactHero: ContactHeroBlock,
  numberedCards: NumberedCardsBlock,
  textCards: TextCardsBlock,
  richText: RichTextBlock,
  imageText: ImageTextBlock,
  image: ImageBlock,
  testimonials: TestimonialsBlock,
  contactDetails: ContactDetailsBlock,
};

/** The background colour a section starts with, used to avoid double spacing between equal sections. */
function backgroundOf(section: Section): Bg {
  switch (section.type) {
    case "hero":
    case "pageHero":
    case "closingCta":
    case "contactHero":
      return "dark";
    case "introSplit":
    case "servicesDetailed":
    case "stepsDetailed":
    case "storySplit":
    case "textCards":
      return "light";
    case "servicesOverview":
    case "steps":
    case "cases":
    case "valuesGrid":
      return "white";
    case "marquee":
    case "faq":
    case "numberedCards":
    case "contactDetails":
      return asBg(section.data.background, "light");
    default:
      return asBg(section.data.background, "white");
  }
}

function hasContent(section: Section, ctx: RenderCtx) {
  if (section.type === "testimonials") return ctx.bundle.testimonials.length > 0;
  if (section.type === "image") return Boolean(ctx.media(section.data.image as string | null));
  return true;
}

export default function Sections({ sections, ctx }: { sections: Section[]; ctx: RenderCtx }) {
  const visible = sections.filter((s) => !s.hidden && hasContent(s, ctx));
  return (
    <>
      {visible.map((section, i) => {
        const prev = visible[i - 1];
        const next = visible[i + 1];
        let spaceTop: SpaceTop = "full";
        if (prev?.type === "marquee" && backgroundOf(prev) === backgroundOf(section)) spaceTop = "small";
        else if (prev && backgroundOf(prev) === backgroundOf(section) && backgroundOf(section) !== "dark") spaceTop = "none";
        const Render = renderers[section.type];
        return (
          <Render
            key={section.id}
            data={section.data}
            ctx={ctx}
            layout={{ spaceTop, nextBg: next ? backgroundOf(next) : null, index: i }}
          />
        );
      })}
    </>
  );
}
