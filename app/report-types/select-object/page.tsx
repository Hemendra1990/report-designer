"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { InputWithIcon } from "@/components/ui/input-with-icon";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// This would be fetched from an API in a real application
// Mock function to simulate fetching objects from an API
const fetchObjects = async (searchTerm: string = "", page: number = 1, pageSize: number = 20) => {
  // This is a mock implementation - in a real app this would be a fetch call
  // to your backend API that returns objects matching the search term
  
  // Generate a larger set of mock objects for demonstration
  const allObjects = Array.from({ length: 150 }, (_, i) => {
    const id = `object_${i + 1}`;
    const categoryNum = Math.floor(i / 30); // Divide into 5 categories
    let category, prefix, description;
    
    switch(categoryNum) {
      case 0:
        category = "Standard";
        prefix = "std_";
        description = "Standard objects for core functionality";
        break;
      case 1:
        category = "Custom";
        prefix = "custom_";
        description = "Custom objects specific to your organization";
        break;
      case 2:
        category = "Analytics";
        prefix = "analytics_";
        description = "Objects for analytics and reporting";
        break;
      case 3:
        category = "Integration";
        prefix = "integration_";
        description = "Objects used for third-party integrations";
        break;
      default:
        category = "External";
        prefix = "ext_";
        description = "External objects from connected systems";
    }

    // Create some common objects that always appear
    if (i < 3) {
      switch(i) {
        case 0:
          return {
            id: "account",
            name: "Account",
            category: "Standard",
            description: "Represents a customer, prospect, or other organization",
            icon: "/icons/account.svg",
          };
        case 1:
          return {
            id: "contact",
            name: "Contact",
            category: "Standard",
            description: "Represents a person associated with an account",
            icon: "/icons/contact.svg",
          };
        case 2:
          return {
            id: "opportunity",
            name: "Opportunity",
            category: "Standard",
            description: "Represents a potential sale or deal",
            icon: "/icons/opportunity.svg",
          };
      }
    }
    
    // Generate various object names
    const objectNames = [
      "Asset", "Campaign", "Case", "Contract", "Event", "Invoice", "Lead", 
      "Order", "Product", "Project", "Quote", "Task", "User", "Document", 
      "Report", "Dashboard", "Setting", "Permission", "Role", "Group",
      "Template", "Configuration", "Subscription", "Transaction", "Attachment"
    ];
    
    const nameIndex = i % objectNames.length;
    const suffix = Math.floor(i / objectNames.length);
    const name = suffix > 0 ? `${objectNames[nameIndex]} ${suffix}` : objectNames[nameIndex];
    
    return {
      id: `${prefix}${name.toLowerCase().replace(/\s/g, '_')}`,
      name,
      category,
      description: `${description} - ${name}`,
      icon: i % 3 === 0 ? "/icons/account.svg" : i % 3 === 1 ? "/icons/contact.svg" : "/icons/opportunity.svg",
    };
  });
  
  // Filter objects based on search term
  const filteredObjects = searchTerm
    ? allObjects.filter(obj => 
        obj.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        obj.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        obj.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : allObjects;
  
  // Calculate pagination
  const totalCount = filteredObjects.length;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedObjects = filteredObjects.slice(startIndex, endIndex);

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return {
    objects: paginatedObjects,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalCount / pageSize),
      totalCount,
      hasMore: endIndex < totalCount
    }
  };
};

export default function SelectObject() {
  const searchParams = useSearchParams();
  const reportType = searchParams.get("type") || "";
  
  const [selectedObject, setSelectedObject] = useState<string>("");
  const [formData, setFormData] = useState({
    displayLabel: "",
    apiName: "",
    description: "",
  });
  
  // Add search and pagination state
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [availableObjects, setAvailableObjects] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasMore: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // Load objects on initial render and when search/pagination changes
  const loadObjects = useCallback(async (term: string = searchTerm, page: number = pagination.currentPage) => {
    setIsLoading(true);
    try {
      const result = await fetchObjects(term, page);
      setAvailableObjects(result.objects);
      setPagination(result.pagination);
      
      // Extract unique categories
      const uniqueCategories = new Set<string>();
      result.objects.forEach((obj: any) => {
        if (obj.category) {
          uniqueCategories.add(obj.category);
        }
      });
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Error loading objects:", error);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, pagination.currentPage]);

  useEffect(() => {
    loadObjects();
  }, [loadObjects]);

  // Handle searching with debounce
  useEffect(() => {
    if (isSearching) {
      const timer = setTimeout(() => {
        loadObjects(searchTerm, 1); // Reset to first page on new search
        setIsSearching(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isSearching, searchTerm, loadObjects]);

  // Pre-fill form when an object is selected
  useEffect(() => {
    if (selectedObject) {
      const selectedObj = availableObjects.find(obj => obj.id === selectedObject);
      if (selectedObj) {
        setFormData({
          displayLabel: selectedObj.name + " Report Type",
          apiName: selectedObj.id + "_report_type",
          description: `Report type for ${selectedObj.name} objects`
        });
      }
    } else {
      setFormData({
        displayLabel: "",
        apiName: "",
        description: "",
      });
    }
  }, [selectedObject, availableObjects]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsSearching(true);
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category === selectedCategory ? "" : category);
    // When category changes, we'll need to reload objects with the filter
    loadObjects(searchTerm, 1);
  };

  // Filter objects by selected category
  const displayedObjects = selectedCategory 
    ? availableObjects.filter(obj => obj.category === selectedCategory)
    : availableObjects;

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="bg-primary text-primary-foreground py-4 px-6 shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/next.svg" 
              alt="Report Designer Logo" 
              width={80} 
              height={20}
              className="dark:invert" 
            />
            <span className="font-bold text-lg">Report Designer</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost">Home</Button>
            </Link>
            <Link href="/reports">
              <Button variant="ghost">Reports</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Link href="/report-types" className="hover:text-foreground">Select Report Type</Link>
            <span>→</span>
            <span className="text-foreground font-medium">Select Primary Object</span>
            <span>→</span>
            <span className="text-muted-foreground">Select Related Objects</span>
          </div>
          <h1 className="text-3xl font-bold mt-4 mb-2">Select Primary Object</h1>
          <p className="text-muted-foreground">
            Select the primary object/table that is the main focus of reports created with this report type.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-[2fr_3fr]">
          {/* Left side - Object Selection */}
          <div>
            <div className="mb-6">
              <InputWithIcon
                type="text"
                placeholder="Search objects..."
                value={searchTerm}
                onChange={handleSearchChange}
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                }
              />
            </div>

            {/* Category filter */}
            {categories.size > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Filter by Category</h3>
                <div className="flex flex-wrap gap-2">
                  {Array.from(categories).map(category => (
                    <button
                      key={category}
                      onClick={() => handleCategoryFilter(category)}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                        selectedCategory === category 
                          ? "bg-primary text-primary-foreground border-primary" 
                          : "bg-background border-input hover:border-primary/50"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Loading state */}
            {isLoading && (
              <div className="flex justify-center my-8">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            )}

            {/* Objects list */}
            {!isLoading && (
              <>
                <div className="mb-2 flex justify-between items-center">
                  <h2 className="text-xl font-bold">Available Objects</h2>
                  <div className="text-sm text-muted-foreground">
                    {pagination.totalCount} objects found
                  </div>
                </div>

                <div className="h-[60vh] overflow-y-auto pr-2 space-y-2">
                  <RadioGroup
                    value={selectedObject}
                    onValueChange={setSelectedObject}
                    className="grid gap-2"
                  >
                    {displayedObjects.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No objects found matching your search criteria
                      </div>
                    ) : (
                      displayedObjects.map((object) => (
                        <div key={object.id} className="cursor-pointer">
                          <Card 
                            className={`transition-all hover:border-primary ${
                              selectedObject === object.id 
                                ? "border-2 border-primary bg-primary/5"
                                : ""
                            }`}
                          >
                            <label 
                              htmlFor={`object-${object.id}`}
                              className="cursor-pointer"
                            >
                              <div className="flex items-center gap-3 p-3">
                                <RadioGroupItem 
                                  value={object.id} 
                                  id={`object-${object.id}`}
                                  className="mt-0"
                                />
                                <div className="bg-primary/10 p-1.5 rounded-md text-primary">
                                  <Image
                                    src={object.icon}
                                    alt={object.name}
                                    width={20}
                                    height={20}
                                    className="text-primary"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-medium text-sm truncate">{object.name}</h3>
                                  <p className="text-xs text-muted-foreground truncate">{object.category}</p>
                                </div>
                              </div>
                            </label>
                          </Card>
                        </div>
                      ))
                    )}
                  </RadioGroup>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => loadObjects(searchTerm, pagination.currentPage - 1)}
                      disabled={pagination.currentPage <= 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => loadObjects(searchTerm, pagination.currentPage + 1)}
                      disabled={!pagination.hasMore}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right side - Object Details Form */}
          <div>
            {selectedObject && (
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-4">Selected Object</h2>
                <Card className="bg-primary/5 border-primary">
                  <CardContent className="p-4">
                    {availableObjects.find(obj => obj.id === selectedObject) && (
                      <div className="flex items-start gap-4">
                        <div className="bg-primary/10 p-2 rounded-md text-primary mt-1">
                          <Image
                            src={availableObjects.find(obj => obj.id === selectedObject)?.icon || "/icons/account.svg"}
                            alt={availableObjects.find(obj => obj.id === selectedObject)?.name || "Object"}
                            width={24}
                            height={24}
                            className="text-primary"
                          />
                        </div>
                        <div>
                          <h3 className="font-medium text-lg">{availableObjects.find(obj => obj.id === selectedObject)?.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {availableObjects.find(obj => obj.id === selectedObject)?.description}
                          </p>
                          <div className="mt-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                              {availableObjects.find(obj => obj.id === selectedObject)?.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            <Card className={`transition-all ${!selectedObject ? "opacity-50" : ""}`}>
              <CardHeader>
                <CardTitle>Report Type Details</CardTitle>
                <CardDescription>
                  Provide information about this report type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="displayLabel">Display Label</Label>
                    <Input 
                      id="displayLabel" 
                      name="displayLabel"
                      value={formData.displayLabel}
                      onChange={handleInputChange}
                      placeholder="Enter a descriptive name"
                      disabled={!selectedObject}
                    />
                    <p className="text-xs text-muted-foreground">This name appears in the report type selector</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apiName">API Name</Label>
                    <Input 
                      id="apiName" 
                      name="apiName"
                      value={formData.apiName}
                      onChange={handleInputChange}
                      placeholder="A unique identifier"
                      disabled={!selectedObject}
                    />
                    <p className="text-xs text-muted-foreground">Unique identifier used in API requests</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe what this report type is used for"
                      disabled={!selectedObject}
                    />
                    <p className="text-xs text-muted-foreground">Helps users understand when to use this report type</p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-between">
          <Link href="/report-types">
            <Button variant="outline">Back</Button>
          </Link>
          <div className="flex gap-4">
            <Link href="/report-types">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Link 
              href={selectedObject && formData.displayLabel && formData.apiName 
                ? `/report-types/define-relationships?type=${reportType}&object=${selectedObject}&label=${encodeURIComponent(formData.displayLabel)}&api=${encodeURIComponent(formData.apiName)}&desc=${encodeURIComponent(formData.description)}`
                : "#"
              }
            >
              <Button disabled={!selectedObject || !formData.displayLabel || !formData.apiName}>
                Next
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}