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
        title="SẢN PHẨM Áo NAM"
        keyword="Áo"
        limit={10}
        viewMoreLink="/products?keyword=Áo Nam"
      />

      <ProductKeywordSection
        title="SẢN PHẨM QUẦN"
        keyword="quần"
        limit={10}
        viewMoreLink="/products?keyword=quần"
      />


      <TestimonialSection />
      <BlogSection />
      <MembershipSection />
    </MainLayout>
  );
}
