import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Star, Zap } from "lucide-react";

import "./CategoryRail.scss";

const CategoryRail = ({ categories = [], activeCategory, onCategoryChange }) => {
  const railRef = useRef(null);

  useEffect(() => {
    const activeButton = railRef.current?.querySelector(`[data-category="${CSS.escape(activeCategory)}"]`);
    activeButton?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [activeCategory]);

  const scrollBy = (direction) => {
    railRef.current?.scrollBy({ left: direction * 180, behavior: "smooth" });
  };

  const handleWheel = (event) => {
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
      return;
    }

    event.preventDefault();
    railRef.current?.scrollBy({ left: event.deltaY, behavior: "smooth" });
  };

  return (
    <div className="category-rail">
      <button type="button" className="category-rail__arrow" aria-label="Kategoriyalarni chapga surish" onClick={() => scrollBy(-1)}>
        <ChevronLeft size={16} />
      </button>

      <div ref={railRef} className="category-rail__track" role="tablist" aria-label="Kategoriyalar" onWheel={handleWheel}>
        {categories.map((category) => {
          const active = activeCategory === category;
          return (
            <button
              type="button"
              role="tab"
              aria-selected={active}
              data-category={category}
              className={active ? "is-active" : ""}
              key={category}
              onClick={() => onCategoryChange?.(category)}
            >
              {category === "Sevimli" && <Star size={14} />}
              {category === "Yaqinda" && <Zap size={14} />}
              <span>{category}</span>
            </button>
          );
        })}
      </div>

      <button type="button" className="category-rail__arrow" aria-label="Kategoriyalarni o'ngga surish" onClick={() => scrollBy(1)}>
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default CategoryRail;
