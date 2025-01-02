import { h } from "preact";
import { useEffect, useState } from "preact/hooks";
import { emit, on } from "@create-figma-plugin/utilities";

interface StringFilterProps {
  onFilterChange: (os: string, product: string) => void;
}

const StringFilter: React.FC<StringFilterProps> = ({ onFilterChange }) => {
  const [selectedOS, setSelectedOS] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<string>("");

  useEffect(() => {
    // Load saved filters
    emit("GET_FILTER");

    const handleFilterLoaded = (filter: string) => {
      if (filter) {
        const { os, product } = JSON.parse(filter);
        setSelectedOS(os || "");
        setSelectedProduct(product || "");
        onFilterChange(os, product);
      }
    };

    on("FILTER_LOADED", handleFilterLoaded);
    return () => {
      // Cleanup listener
    };
  }, []);

  const handleOSChange = (e: Event) => {
    const os = (e.target as HTMLSelectElement).value;
    setSelectedOS(os);
    saveFilters(os, selectedProduct);
    onFilterChange(os, selectedProduct);
  };

  const handleProductChange = (e: Event) => {
    const product = (e.target as HTMLSelectElement).value;
    setSelectedProduct(product);
    saveFilters(selectedOS, product);
    onFilterChange(selectedOS, product);
  };

  const saveFilters = (os: string, product: string) => {
    emit("SAVE_FILTER", JSON.stringify({ os, product }));
  };

  return (
    <div className="flex gap-2 mb-4">
      <select
        className="select select-sm select-bordered flex-1"
        value={selectedOS}
        onChange={handleOSChange}
      >
        <option value="">All OS</option>
        <option value="ios">iOS</option>
        <option value="android">Android</option>
        <option value="common">Common</option>
      </select>

      <select
        className="select select-sm select-bordered flex-1"
        value={selectedProduct}
        onChange={handleProductChange}
      >
        <option value="">All Products</option>
        <option value="adotphone">AdotPhone</option>
        <option value="aiphone">AiPhone</option>
      </select>
    </div>
  );
};

export default StringFilter;
