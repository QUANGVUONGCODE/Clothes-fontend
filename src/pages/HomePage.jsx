import MainLayout from '../layouts/MainLayout';
import CategorySection from '../components/home/CategorySection';
import ProductGridSection from '../components/product/ProductGridSection';
import BrandBenefits from '../components/home/BrandBenefits';
import TestimonialSection from '../components/home/TestimonialSection';
import BlogSection from '../components/blog/BlogSection';
import ProductKeywordSection from "../components/home/ProductKeywordSection";
import { products } from '../data/products';
import HeroBanner from "../components/home/HeroBanner";
import { heroBanners } from "../data/banners";
import SubCategoryShowcase from '../components/home/SubCategoryShowcase';
import MembershipSection from "../components/home/MembershipSection";

export default function HomePage() {
  return (
    <MainLayout>
      <HeroBanner banners={heroBanners} />
      <SubCategoryShowcase />
      <ProductKeywordSection
        title="SẢN PHẨM PICKLEBALL"
        keyword="pickleball"
        limit={10}
        viewMoreLink="/products?keyword=pickleball"
      />

      <ProductKeywordSection
        title="SẢN PHẨM PICKLEBALL"
        keyword="legging"
        limit={10}
        viewMoreLink="/products?keyword=legging"
      />

      <ProductKeywordSection
        title="SẢN PHẨM PICKLEBALL"
        keyword="quần lót"
        limit={10}
        viewMoreLink="/products?keyword=quần lót"
      />

      <TestimonialSection />
      <BlogSection />
      <MembershipSection />
    </MainLayout>
  );
}
