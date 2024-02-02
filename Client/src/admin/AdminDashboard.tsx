import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import { useForm } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid'
import Multiselect from 'multiselect-react-dropdown';


function AdminDashboard() {
const authToken = localStorage.getItem('token');
const navigate = useNavigate();
const [isDropdownOpen, setIsDropdownOpen] = useState(false);
const [lines, setLines] = useState([]);
const [isTicketFormVisible, setIsTicketFormVisible] = useState(false);
const [isTicketListVisible, setIsTicketListVisible] = useState(false);
const [isLineFormVisible, setIsLineFormVisible] = useState(false);
const [isLineListVisible, setIsLineListVisible] = useState(false);
const [tripType, setTripType] = useState('');
const [lineName, setLineName] = useState('');
const [productsCount, setProductsCount] = useState(0);
const [departureDate, setDepartureDate] = useState('');
const [returnDate, setReturnDate] = useState('');
const [selectedImage, setSelectedImage] = useState(null);
const [tickets, setTickets] = useState([]); // State to store tickets data
const [secondPickUpTime, setSecondPickUpTime] = useState('');
const [secondPickUpLocation, setSecondPickUpLocation] = useState('');
const [thirdPickUpTime, setThirdPickUpTime] = useState('');
const [thirdPickUpLocation, setThirdPickUpLocation] = useState('');
const [finalPickUpTime, setFinalPickUpTime] = useState('');
const [finalPickUpLocation, setFinalPickUpLocation] = useState('');
const [firstDropOffLocation, setFirstDropOffLocation] = useState('');
const [secondDropOffLocation, setSecondDropOffLocation] = useState('');
const [thirdDropOffLocation, setThirdDropOffLocation] = useState('');
const [finalDropOffLocation, setFinalDropOffLocation] = useState('');
const [firstPickUpTimeReturn, setFirstPickUpTimeReturn] = useState('');
const [firstPickUpLocationReturn, setFirstPickUpLocationReturn] = useState('');
const [firstDropOffLocationReturn, setFirstDropOffLocationReturn] = useState('');
const [secondPickUpTimeReturn, setSecondPickUpTimeReturn] = useState('');
const [secondPickUpLocationReturn, setSecondPickUpLocationReturn] = useState('');
const [secondDropOffLocationReturn, setSecondDropOffLocationReturn] = useState('');
const [thirdPickUpTimeReturn, setThirdPickUpTimeReturn] = useState('');
const [thirdPickUpLocationReturn, setThirdPickUpLocationReturn] = useState('');
const [thirdDropOffLocationReturn, setThirdDropOffLocationReturn] = useState('');
const [finalPickUpTimeReturn, setFinalPickUpTimeReturn] = useState('');
const [finalPickUpLocationReturn, setFinalPickUpLocationReturn] = useState('');
const [finalDropOffLocationReturn, setFinalDropOffLocationReturn] = useState('');
const [suggestedTipForDriverReturn, setSuggestedTipForDriverReturn] = useState('');
const [suggestedTipForDriver, setSuggestedTipForDriver] = useState('');
const [isModalVisible, setIsModalVisible] = useState(false);
const [lastAction, setLastAction] = useState('');
const [lineTitle, setLineTitle] = useState(''); // State for line title
const [lineSlug, setLineSlug] = useState('');
const [dropdownOpen, setDropdownOpen] = useState(false);
const [pinnedTickets, setPinnedTickets] = useState([]);
const [editingLineId, setEditingLineId] = useState(null);
// State to manage selected products for a line
const [selectedProducts, setSelectedProducts] = useState([]);
const lineDropDownRef = useRef();
const [editMode, setEditMode] = useState(false);
const [currentLineId, setCurrentLineId] = useState(null);
let timeoutId;
const isMounted = useRef(true);
const [automatedValues, setAutomatedValues] = useState({
  itemId: '',
  created: '',
  lastEdited: '',
  lastPublished: '',
});

const handleSlugChange = (e) => {
  const newSlug = e.target.value;
  setNewLine({ ...newLine, slug: newSlug });
  setValue('slug', newSlug); // Update the slug in the form
};

useEffect(() => {
  // Function to add and remove the event listener
  const addRemoveEventListener = (action) => {
    // The action parameter is a string that can be 'add' or 'remove'
    const method = action === 'add' ? 'addEventListener' : 'removeEventListener';
    document[method]('mousedown', handleOutsideClick);
  };

  // Add event listener when dropdown opens
  if (isDropdownOpen) {
    addRemoveEventListener('add');
  }

  // Clean up event listener when dropdown closes or component unmounts
  return () => {
    addRemoveEventListener('remove');
  };
}, [isDropdownOpen]);

const handleOutsideClick = (e) => {
  if (!lineDropDownRef.current.contains(e.target)) {
    setIsDropdownOpen(false);
  }
};

const handleEditLineClick = (line) => {
  setCurrentLineId(line._id); // Save the editing line's ID
  setNewLine({
    name: line.name,
    slug: line.slug,
    status: line.status,
    products: line.products, // Assuming line has a products field
    // ... set other fields you want to pre-fill
  });
  setSelectedProducts(line.products); // Set the selected products for the line
  setIsLineFormVisible(true); // Show the line form for editing
  setEditMode(true); // Enable edit mode
};


const { register, handleSubmit, watch, setValue, trigger, formState: { errors }, reset } = useForm();
const slugValue = watch('slug')

const handleSelectProduct = (selectedList, selectedItem) => {
  console.log('Selected item:', selectedItem);

  // Add the new selected item only if it is not already selected
  if (!selectedList.some(product => product.id === selectedItem.id)) {
    const newProduct = {
      id: selectedItem.id, // Assuming your items have an 'id' property
      count: 1, // Default count for new selection
      // ...include any other item properties you need here
    };

    setSelectedProducts([...selectedList, newProduct]); // Use the selectedList provided by the onSelect callback
  }

  // Update the products count based on the updated selectedList
  setProductsCount(selectedList.length);
};

const handleRemoveProduct = (selectedList, removedItem) => {
  const newList = selectedList.filter(product => product.id !== removedItem.id);
  setSelectedProducts(newList); // Set the filtered list
  setProductsCount(newList.length); // Update the products count
};

const [loading, setLoading] = useState(false);
// Create an Axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Function to refresh token
const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  try {
    const response = await axios.post('http://localhost:5000/refresh-token', { refreshToken });
    const { accessToken } = response.data;
    localStorage.setItem('token', accessToken);
    return accessToken;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw new Error('Failed to refresh token');
  }
};

// Add request interceptor to include the token in every request
api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptor to refresh token if expired
api.interceptors.response.use((response) => {
  return response;
}, async (error) => {
  const originalRequest = error.config;
  if (error.response.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;
    const newAccessToken = await refreshToken();
    axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
    return api(originalRequest);
  }
  return Promise.reject(error);
});
;

useState(() => {
  const newItemId = uuidv4(); // Generate a unique Item ID
  const timestamp = new Date().toISOString(); // Get the current timestamp

  setAutomatedValues({
    itemId: newItemId,
    created: timestamp,
    lastEdited: timestamp,
    lastPublished: timestamp,
  });
}, []);


// Function to check if the token is expired and redirect to login
const checkTokenExpiration = (response) => {
  if (response.status === 401 || response.data?.message === "jwt expired") {
    localStorage.removeItem('token'); // Remove the expired token
    navigate('http://localhost:5173/login'); // Redirect to the login page
  }
};

const handleImageChange = (e:any) => {
  if (e.target.files && e.target.files[0]) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      // Set the preview image
      setSelectedImage(reader.result);

      // Append the new image file to the ticketData images array
      setTicketData({
        ...ticketData,
        images: [...ticketData.images, newImageURL] // newImageURL should be a string
      });
    };
    reader.readAsDataURL(file);
  }
};

const deleteImage = () => {
  // Implement the logic to delete the image
  setSelectedImage(null);
  // If you also need to remove the image from the ticketData state, adjust accordingly
  setTicketData({ ...ticketData, images: ticketData.images.filter((img) => img !== selectedImage) });
};


const refreshTokenIfNeeded = async () => {
  const authToken = localStorage.getItem('token');
  const refreshToken = localStorage.getItem('refreshToken');
  console.log(authToken)
  if (!authToken || !refreshToken) {
    navigate('/login');
    return;
  }

  try {
    const decodedToken = jwtDecode(authToken);
    if (decodedToken.exp * 1000 < Date.now()) {
      const response = await axios.post('http://localhost:5000/refresh-token', { refreshToken });
      localStorage.setItem('token', response.data.accessToken);
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  }
};

useEffect(() => {
  refreshTokenIfNeeded();
}, []);


useEffect(() => {
  const fetchTickets = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/tickets', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      checkTokenExpiration(response); // Check if token has expired
      setTickets(response.data);
    } catch (error) {
      console.error('Fetch error:', error);
      checkTokenExpiration(error.response); // Check if token has expired
    }
  };

  fetchTickets();
}, [authToken, navigate]);

const [selectedTicket, setSelectedTicket] = useState(null);
const [selectedCategories, setSelectedCategories] = useState([]);
const handleCategorySelect = (event) => {
   const value = Array.from(
     event.target.selectedOptions,
     (option) => option.value
   );
   setSelectedCategories(value);
 };

 const handleRemoveCategory = (category) => {
   setSelectedCategories(selectedCategories.filter((c) => c !== category));
 };
 

 const toggleLineFormVisibility = () => {
  setIsLineFormVisible(false);
  setIsLineListVisible(true)
  setIsTicketListVisible(false);
  setIsTicketFormVisible(false) // Hide the ticket form when toggling the line form
};

const toggleTicketFormVisibility = () => {
  setIsTicketListVisible(!isTicketFormVisible);
  setIsLineFormVisible(false); // Hide the line form when toggling the ticket form\
  setIsLineListVisible(false);
};

 // or your state management
const [showCreateOptions, setShowCreateOptions] = useState(false);

  const handleCreateClick = () => {
    setShowCreateOptions(!showCreateOptions);
  };

  const handleSaveOption = (option) => {
   console.log(`Save as: ${option}`);
   // Implement save functionality based on the option
   setShowCreateOptions(false);
 };

 const handleCancel = () => {
   setIsTicketFormVisible(false);
 };

 const [ticketData, setTicketData] = useState({
  productType: '',
  name: '',
  slug: '',
  description: '',
  categories: [], // Assuming this will be an array of category names
  images: [], // Assuming this will be an array of image URLs
  price: '',
  compareAtPrice: '',
  sku: '',
  stops: '',
  firstPickUpTime: '',
  firstPickUpLocation: '',
  trackInventory: false,
  inventoryQuantity: 0,
  inventoryPolicy: '',
  requiresShipping: false,
  createdOn: new Date().toISOString(),
  updatedOn: new Date().toISOString(),
  publishedOn: new Date().toISOString(), // You might want to adjust this based on your business logic
});


  
const [newLine, setNewLine] = useState({
  name: '',
  slug: '',
  status: 'Published', // default value
  products: 0, // default value, assuming it's a new line with no products yet
  modified: new Date().toISOString(),
  published: new Date().toISOString(),
});

// Function to create a slug from the name
const createSlug = (name) => {
  if (!name) return '';
  // Replace spaces with '-' and convert to lowercase
  let slug = name.trim().toLowerCase().replace(/\s+/g, '-');
  // Add '-1' suffix if the slug is one word (no spaces)
  if (!slug.includes('-')) {
    slug = `${slug}-1`; // You may want to adjust the logic for numbering
  }
  return slug;
};


// Handler for when the name input changes
const handleNameChange = (e) => {
  const name = e.target.value;
  const slug = createSlug(name);
  setNewLine({ ...newLine, name, slug });
  
  // Update form values using setValue from useForm
  setValue('slug', slug, { shouldValidate: true });
  // Optionally trigger validation for the slug field
  trigger('slug');
};

const fetchLines = async () => {
  if (isLineListVisible) {
    setLoading(true); // Start the loading (skeleton animation)

    // Set a minimum display time for the loading animation
    timeoutId = setTimeout(() => {
      if (isMounted) {
        setLoading(false);
      }
    }, 5000);

    try {
      const response = await axios.get('http://localhost:5000/api/lines', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      clearTimeout(timeoutId); // Clear the timeout as data has been fetched

      if (response.status !== 200) {
        throw new Error('Error fetching lines');
      }

      if (Array.isArray(response.data)) {
        if (isMounted) {
          setLines(response.data);
          setLoading(false); // Stop the loading if data is fetched
        }
      } else {
        console.error('Data is not an array:', response.data);
      }
    } catch (error) {
      console.error('Error fetching lines:', error);
      // Keep loading state as is to continue showing animation
    }
  }
};

useEffect(() => {
  let isMounted = true;

  if (isLineListVisible) {
    setLoading(true);
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        setLoading(false);
      }
    }, 5000);

    // Call fetchLines inside the useEffect
    fetchLines().catch(console.error);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }
}, [isLineListVisible, authToken]);// Use isLineListVisible instead of isLineFormVisible if it's the correct dependency


useEffect(() => {
    if (isLineListVisible) {
      fetchLines();
    }
  }, [isLineListVisible, authToken]);

  // Fetch a single line data for editing
  const fetchLineData = async (id) => {
    try {
      const response = await api.get(`/lines/${id}`);
      const lineData = response.data;
      setNewLine(lineData);
      // Add other necessary fields like selectedProducts, etc.
      setSelectedProducts(lineData.products); // Assuming `products` is an array of product objects
      // Set the edit mode to true
      setEditMode(true);
    } catch (error) {
      console.error('Error fetching line data:', error);
    }
  };

  // Handler to initiate editing mode
  const handleEditLine = (line) => {
    setCurrentLineId(line._id);
    fetchLineData(line._id);
    setIsLineFormVisible(true); // Show the line form for editing
  };


// Form submission handler
const handleLineSubmit = handleSubmit(async (data) => {
  const url = currentLineId ? `/api/lines/${currentLineId}` : '/api/lines';
  const method = currentLineId ? 'patch' : 'post';
  
  const lineData = {
    ...data,
    products: selectedProducts.map(product => ({
      id: product.id,
      count: product.count
    })),
    productsCount: productsCount,
    // Include automatedValues if it's a new line creation
    ...(currentLineId ? {} : automatedValues),
  };

  try {
    const response = await axios[method](url, lineData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200 || response.status === 201) {
      const updatedLines = currentLineId
        ? lines.map(line => (line._id === currentLineId ? response.data : line))
        : [...lines, response.data];

      setLines(updatedLines);
      setIsLineFormVisible(false);
      reset();
      setEditMode(false);
      setCurrentLineId(null);
    }
  } catch (error) {
    console.error('Error submitting line:', error);
    // ... handle error
  }
});
    

  const handleLogout = () => {
   localStorage.removeItem('token'); // Remove the token
   navigate('/'); // Redirect to home page
 };

 const handleTicketSelect = (ticket) => {
   setSelectedTicket(ticket);
   setIsTicketFormVisible(true);
   // Update form fields with the selected ticket data
   setTicketData({
     productType: ticket.productType || '',
     name: ticket.name || '',
     slug: ticket.slug || '',
     description: ticket.description || '',
     categories: ticket.categories || [],
     images: ticket.images || [],
     price: ticket.price || '',
     compareAtPrice: ticket.compareAtPrice || '',
     sku: ticket.sku || '',
     trackInventory: ticket.trackInventory || false,
     inventoryQuantity: ticket.inventoryQuantity || 0,
     inventoryPolicy: ticket.inventoryPolicy || '',
     requiresShipping: ticket.requiresShipping || false,
     createdOn: ticket.createdOn || new Date().toISOString(),
     updatedOn: ticket.updatedOn || new Date().toISOString(),
     publishedOn: ticket.publishedOn || new Date().toISOString(),
   });
  
   // If the ticket has categories, set the selected categories state
  if (ticket.categories) {
    setSelectedCategories(ticket.categories);
  }

  // If the ticket has an image, set the selected image for preview
  if (ticket.images && ticket.images.length > 0) {
    setSelectedImage(ticket.images[0]);
  }
};

useEffect(() => {
  let logoutTimer = setTimeout(() => {
    // Logout user after 2 hours
    handleLogout();
  }, 2 * 60 * 60 * 1000); // 2 hours

  const resetTimer = () => {
    clearTimeout(logoutTimer);
    logoutTimer = setTimeout(() => {
      handleLogout();
    }, 2 * 60 * 60 * 1000);
  };

  window.addEventListener('mousemove', resetTimer);
  window.addEventListener('keypress', resetTimer);

  return () => {
    clearTimeout(logoutTimer);
    window.removeEventListener('mousemove', resetTimer);
    window.removeEventListener('keypress', resetTimer);
  };
}, []);

useEffect(() => {
  if (Array.isArray(selectedProducts)) { // Ensure selectedProducts is an array
    const totalProductsCount = selectedProducts.reduce((sum, product) => {
      return sum + product.count;
    }, 0);

    setProductsCount(totalProductsCount);
  }
}, [selectedProducts]);


  return (
    <>
    <div className="flex flex-row min-h-screen bg-gray-100">
<button data-drawer-target="default-sidebar" data-drawer-toggle="default-sidebar" aria-controls="default-sidebar" type="button" className="inline-flex items-center p-2 mt-2 ms-3 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600">
   <span className="sr-only">Open sidebar</span>
   <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
   <path clipRule="evenodd" fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"></path>
   </svg>
</button>

<aside id="default-sidebar" className="w-1/6 bg-gray-800" aria-label="Sidebar">
   <div className="relative h-full px-3 py-4 overflow-y-auto bg-gray-50 dark:bg-gray-800">
      <ul className="space-y-2 font-medium">
         <li>
            <a href="/admin" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
              
               <span className="ms-3 font-xl font-bold">Ecommerce</span>
            </a>
         </li>
         <li>
            <a href="#" onClick={toggleTicketFormVisibility} className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
            <svg className="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="#000000"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="icomoon-ignore"> </g> <path d="M24.782 1.606h-7.025l-16.151 16.108 12.653 12.681 16.135-16.093v-7.096l-5.613-5.6zM29.328 13.859l-15.067 15.027-11.147-11.171 15.083-15.044h6.143l4.988 4.976v6.211z" fill="#000000"> </path> <path d="M21.867 7.999c0 1.173 0.956 2.128 2.133 2.128s2.133-0.954 2.133-2.128c0-1.174-0.956-2.129-2.133-2.129s-2.133 0.955-2.133 2.129zM25.066 7.999c0 0.585-0.479 1.062-1.066 1.062s-1.066-0.476-1.066-1.062c0-0.586 0.478-1.063 1.066-1.063s1.066 0.477 1.066 1.063z" fill="#000000"> </path> </g></svg>
               <span className="flex-1 ms-3 whitespace-nowrap">Tickets</span>
            </a>
         </li>
         <li>
            <a href="#" onClick={toggleLineFormVisibility} className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
               <svg className="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                  <path d="m17.418 3.623-.018-.008a6.713 6.713 0 0 0-2.4-.569V2h1a1 1 0 1 0 0-2h-2a1 1 0 0 0-1 1v2H9.89A6.977 6.977 0 0 1 12 8v5h-2V8A5 5 0 1 0 0 8v6a1 1 0 0 0 1 1h8v4a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-4h6a1 1 0 0 0 1-1V8a5 5 0 0 0-2.582-4.377ZM6 12H4a1 1 0 0 1 0-2h2a1 1 0 0 1 0 2Z"/>
               </svg>
               <span className="flex-1 ms-3 whitespace-nowrap">Lines</span>
               <span className="inline-flex items-center justify-center w-3 h-3 p-3 ms-3 text-sm font-medium text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-300">3</span>
            </a>
         </li>
         <li>
            <a href="#" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
            <svg className="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M14 14H17M14 10H17M9 9.5V8.5M9 9.5H11.0001M9 9.5C7.20116 9.49996 7.00185 9.93222 7.0001 10.8325C6.99834 11.7328 7.00009 12 9.00009 12C11.0001 12 11.0001 12.2055 11.0001 13.1667C11.0001 13.889 11.0001 14.5 9.00009 14.5M9.00009 14.5L9 15.5M9.00009 14.5H7.0001M6.2 19H17.8C18.9201 19 19.4802 19 19.908 18.782C20.2843 18.5903 20.5903 18.2843 20.782 17.908C21 17.4802 21 16.9201 21 15.8V8.2C21 7.0799 21 6.51984 20.782 6.09202C20.5903 5.71569 20.2843 5.40973 19.908 5.21799C19.4802 5 18.9201 5 17.8 5H6.2C5.0799 5 4.51984 5 4.09202 5.21799C3.71569 5.40973 3.40973 5.71569 3.21799 6.09202C3 6.51984 3 7.07989 3 8.2V15.8C3 16.9201 3 17.4802 3.21799 17.908C3.40973 18.2843 3.71569 18.5903 4.09202 18.782C4.51984 19 5.07989 19 6.2 19Z" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
               <span className="flex-1 ms-3 whitespace-nowrap">Orders</span>
            </a>
         </li>
         <li>
            <a href="#" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
               <svg className="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20">
                  <path d="M17 5.923A1 1 0 0 0 16 5h-3V4a4 4 0 1 0-8 0v1H2a1 1 0 0 0-1 .923L.086 17.846A2 2 0 0 0 2.08 20h13.84a2 2 0 0 0 1.994-2.153L17 5.923ZM7 9a1 1 0 0 1-2 0V7h2v2Zm0-5a2 2 0 1 1 4 0v1H7V4Zm6 5a1 1 0 1 1-2 0V7h2v2Z"/>
               </svg>
               <span className="flex-1 ms-3 whitespace-nowrap">Products</span>
            </a>
         </li>
         <li className="absolute bottom-0 w-full">
            <button onClick={handleLogout} className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group w-full">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path opacity="0.5" d="M9.00195 7C9.01406 4.82497 9.11051 3.64706 9.87889 2.87868C10.7576 2 12.1718 2 15.0002 2L16.0002 2C18.8286 2 20.2429 2 21.1215 2.87868C22.0002 3.75736 22.0002 5.17157 22.0002 8L22.0002 16C22.0002 18.8284 22.0002 20.2426 21.1215 21.1213C20.2429 22 18.8286 22 16.0002 22H15.0002C12.1718 22 10.7576 22 9.87889 21.1213C9.11051 20.3529 9.01406 19.175 9.00195 17" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round"></path> <path d="M15 12L2 12M2 12L5.5 9M2 12L5.5 15" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
               <span className="flex-1 ms-3 whitespace-nowrap">Log out</span>
            </button>
         </li>
      </ul>
   </div>
</aside>
{/* List of tickets */}
{isTicketListVisible && (
  <div className={`flex flex-col ${isTicketFormVisible ? 'w-1/3' : 'w-full'} bg-gray-800 text-white`}>
  <div className="p-4 flex justify-between items-center">
    <h2 className="text-xl font-bold">Tickets</h2>
    {!isTicketFormVisible && (
      <div className="flex items-center">
        {/* Buttons go here */}
        <input type="text" placeholder="Search tickets..." className="text-sm rounded p-2 bg-gray-700" />
        <button className="ml-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">Filter</button>
        <button className="ml-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">Select</button>
        <button className="ml-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">Export</button>
        <button className="ml-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">Import</button>
        <button className="ml-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">Settings</button>
        <button
          className="ml-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          onClick={() => setIsTicketFormVisible(true)}
        >
          + New Ticket
        </button>
      </div>
    )}
  </div>
    <ul className="overflow-y-auto">
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr>
            <th className="text-left font-medium">Name</th>
            {!isTicketFormVisible && (
              <>
            <th className="text-left font-medium">Status</th>
            <th className="text-left font-medium">Price</th>
            <th className="text-left font-medium">Product Type</th>
            <th className="text-left font-medium">Modified</th>
            <th className="text-left font-medium">Published</th>
            <th className="text-left font-medium">Actions</th>
            </>
            )}
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr
              key={ticket._id}
              onClick={() => handleTicketSelect(ticket)}
              className="hover:bg-gray-700 cursor-pointer"
            >
              <td className="p-2">{ticket.name}</td>
              <td className={`p-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ticket.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-gray-300 text-gray-800'}`}>
                {ticket.status}
              </td>
              {/* Other cells... */}
              <td className="p-2 text-left">
                <button
                  type="button"
                  onClick={(e:any) => {
                    e.stopPropagation();
                    pinTicket(ticket._id);
                  }}
                  disabled={isTicketFormVisible}
                  className="text-gray-600 hover:text-gray-900"
                >
                  {/* SVG or Font Icon for Pin */}
                  📌
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </ul>
  </div>
)}


{isTicketFormVisible && (
  <main className="w-2/3 bg-gray-800 text-white p-4 overflow-y-auto">
  {/* Header starts here */}


  <div className="bg-gray-800 px-4 py-2 flex justify-between items-center">
  <div className="flex items-center">
    <button
      className="text-white hover:text-blue-500 mr-4"
      onClick={() => setIsTicketFormVisible(false)} // This will close the ticket form
    >
      {/* SVG icon for "back" arrow */}
      <svg fill="#FFFFFF" width="15px" height="24px" viewBox="0 0 52 52">
        <path d="M50,24H6.83L27.41,3.41a2,2,0,0,0,0-2.82,2,2,0,0,0-2.82,0l-24,24a1.79,1.79,0,0,0-.25.31A1.19,1.19,0,0,0,.25,25c0,.07-.07.13-.1.2l-.06.2a.84.84,0,0,0,0,.17,2,2,0,0,0,0,.78.84.84,0,0,0,0,.17l.06.2c0,.07.07.13.1.2a1.19,1.19,0,0,0,.09.15,1.79,1.79,0,0,0,.25.31l24,24a2,2,0,1,0,2.82-2.82L6.83,28H50a2,2,0,0,0,0-4Z"></path>
      </svg>
    </button>
    <h1 className="text-white text-xl font-bold">New Ticket</h1>
  </div>
  <div>
    <button className="text-blue-500 hover:bg-blue-700 hover:text-white px-3 py-1 rounded" onClick={() => {
    publishLine();
    handleLineSubmit(FormData); // Replace formData with actual data if needed
  }}>Publish</button>
    <button className="bg-gray-600 text-gray-300 hover:bg-gray-500 hover:text-white px-3 py-1 rounded ml-2" onClick={() => setIsModalVisible(true)}>Cancel</button>
  </div>
</div>

  {/* Header ends here */}

{isModalVisible && (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
    <div className="bg-gray rounded-lg max-w-sm mx-auto p-4">
      <h2 className="text-lg font-bold mb-4">Exit Without Saving?</h2>
      <p>This item can't be saved because it has errors. Would you like to exit without saving?</p>
      <div className="flex justify-end mt-4">
        <button onClick={() => setIsModalVisible(false)} className="bg-gray-900 hover:bg-gray-400 text-white font-bold py-2 px-4 rounded-l">
          Keep editing
        </button>
        <button onClick={handleCancel} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-r">
          Exit Without Saving
        </button>
      </div>
    </div>
  </div>
)}

  <form onSubmit={handleSubmit} className="h-[calc(100vh-4rem)] overflow-y-auto flex flex-col gap-4 bg-gray-800 text-white p-4 rounded">
    {/* Product Type Dropdown */}
    <div className="mb-4">
      <label htmlFor="productType" className="block text-sm font-medium mb-2">Product Type</label>
      <select
        id="productType"
        name="productType"
        value={ticketData.productType}
        onChange={handleInputChange}
        className="block w-full p-2 text-sm bg-gray-700 rounded focus:outline-none"
      >
        <option value="Physical">Physical</option>
        <option value="Digital">Digital</option>
        <option value="Service">Service</option>
        <option value="Advance">Advance</option>
      </select>
      <p className="text-xs mt-1">
        Service products do not require a shipping address during checkout (e.g., classes, consultations).
      </p>
    </div>

{/* Name Input */}
<div className="mb-4">
  <label htmlFor="name" className="block text-sm font-medium mb-2">
    Name <span className="text-red-500">*</span>
  </label>
  <input
    id="name"
    type="text"
    name="name"
    value={ticketData.name}
    onChange={handleInputChange}
    placeholder="Ticket Name"
    required
    className="block w-full p-2 text-sm bg-gray-700 text-white rounded focus:outline-none"
  />
</div>


{/* Slug Input */}
<div>
  <label className="block text-sm font-medium text-white mb-1" htmlFor="slug">Slug <span className="text-red-700">*</span></label>
  <input
    id="slug"
    {...register('slug', { required: 'Slug is required' })}
    className="w-full p-2 border bg-black border-gray-300 rounded-md focus:outline-none focus:ring-gray-500 focus:border-gray-500"
    placeholder='slug' // Display 'slug' if newLine.slug is empty
    value={newLine.slug} // Set value to newLine.slug
    onChange={handleSlugChange}
  />
  {errors.slug && <span className="text-red-500">{errors.slug.message}</span>}
  <p className="text-white mt-2">www.tri-statecoach.com/category/{newLine.slug || 'slug'}</p>
</div>


    {/* Description TextArea */}
    <div className="mb-4">
      <label htmlFor="description" className="block text-sm font-medium mb-2">Description</label>
      <textarea
        id="description"
        name="description"
        value={ticketData.description}
        onChange={handleInputChange}
        placeholder="Description"
        className="block w-full p-2 text-sm bg-gray-700 rounded focus:outline-none"
      ></textarea>
    </div>

    {/* Categories Select */}
    <div className="mb-4">
      <label htmlFor="categories" className="block text-sm font-medium mb-2">
        Categories
      </label>
      <p className="text-xs mb-4">
        Add this product to one or more categories.
      </p>
      <select
        id="categories"
        name="categories"
        multiple
        value={selectedCategories}
        onChange={handleCategorySelect}
        className="w-full p-2 text-sm bg-gray-700 rounded focus:outline-none"
      >
        {lines.map((line) => (
          <option key={line._id} value={line.name}>
            {line.name}
          </option>
        ))}
      </select>
      {/* Display selected categories */}
      <div className="flex flex-wrap gap-2 mt-2">
        {selectedCategories.map((category) => (
          <span
            key={category}
            className="flex items-center px-3 py-1 text-sm bg-gray-600 rounded-full"
          >
            {category}
            <button
              type="button"
              onClick={() => handleRemoveCategory(category)}
              className="flex items-center justify-center w-4 h-4 ml-2 rounded-full hover:text-gray-300"
            >
              &times;
            </button>
          </span>
        ))}
      </div>
    </div>


{/* Media Section */}
<div className="mb-4 bg-gray-100 p-4 rounded">
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-2">Main image</label>
    {selectedImage ? (
      <div className="flex items-center space-x-2 mb-2">
        <img src={selectedImage} alt="Selected" className="h-20 w-20 object-cover rounded" />
        <div className="flex flex-col">
          <span className="text-xs font-medium">Filename: {selectedImage.name}</span>
          <span className="text-xs text-gray-500">Size: {selectedImage.size} KB</span>
        </div>
        <button type="button" onClick={() => setSelectedImage(null)} className="text-gray-500 hover:text-gray-700">
          Replace
        </button>
        <button type="button" onClick={deleteImage} className="text-gray-500 hover:text-gray-700">
          Delete
        </button>
      </div>
    ) : (
      <div className="flex justify-center items-center w-full">
        <label className="flex flex-col w-full h-32 border-4 border-dashed hover:bg-gray-200 hover:border-gray-400 rounded-lg group">
          <div className="flex flex-col items-center justify-center pt-7">
            <svg className="w-10 h-10 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M28 8H12a4 4 0 0 0-4 4v20m32-12v8m0 0v8a4 4 0 0 1-4 4H12m28-12H8m20-28v12m0 0H20m8 0h8"></path></svg>
            <p className="pt-1 text-sm tracking-wider text-gray-400 group-hover:text-gray-600">
              Click to browse for files
            </p>
          </div>
          <input
            type="file"
            id="mainImage"
            name="mainImage"
            onChange={handleImageChange}
            className="opacity-0"
          />
        </label>
      </div>
    )}
  </div>
</div>


{/* Billing Section */}
<div className="bg-gray-800 p-4 rounded text-white">
  <h4 className="text-lg font-semibold mb-4">Billing</h4>
  <div className="flex items-center gap-4 mb-4">
    <div className="flex-1">
      <label htmlFor="price" className="block text-sm font-medium mb-1">Price <span className='text-red-500'>*</span></label>
      <div className="flex items-center bg-gray-700 rounded">
        <span className="pl-2 text-gray-300">$</span>
        <input
          id="price"
          type="text"
          name="price"
          value={ticketData.price}
          onChange={handleInputChange}
          placeholder="0.00"
          className="flex-1 bg-transparent text-white p-2 rounded focus:ring-0"
        />
      </div>
    </div>
    <div className="flex-1">
      <label htmlFor="compareAtPrice" className="block text-sm font-medium mb-1">Compare-at price</label>
      <div className="flex items-center bg-gray-700 rounded">
        <span className="pl-2 text-gray-300">$</span>
        <input
          id="compareAtPrice"
          type="text"
          name="compareAtPrice"
          value={ticketData.compareAtPrice}
          onChange={handleInputChange}
          placeholder="0.00"
          className="flex-1 bg-transparent text-white p-2 rounded focus:ring-0"
        />
      </div>
    </div>
  </div>
</div>



{/* Product Tax Class */}
<div>
  <label htmlFor="productTaxClass" className="block mb-2 text-sm font-medium text-gray-700">Product Tax Class</label>
  <select
    id="productTaxClass"
    name="productTaxClass"
    value={ticketData.productTaxClass}
    onChange={handleInputChange}
    className="block w-full p-2 mb-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring"
  >
    <option value="Standard">Standard automatic tax calculation</option>
    <option value="Exempt">Exempt from taxes</option>
    {/* Additional tax class options */}
  </select>
  <p className="text-xs text-gray-500">Enable tax calculation to collect sales tax from your customers.</p>
</div>
{/* Identifiers Section */}
<div>
  <label htmlFor="sku" className="block mb-2 text-sm font-medium text-gray-700">SKU</label>
  <input
    id="sku"
    type="text"
    name="sku"
    value={ticketData.sku}
    onChange={handleInputChange}
    className="block w-full p-2 mb-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring"
  />
</div>

{/* Inventory Section */}
<div className="mb-4 flex items-center justify-between">
  <span className="text-sm font-medium text-white">Track inventory</span>
  <label htmlFor="trackInventory" className="relative inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      id="trackInventory"
      name="trackInventory"
      className="sr-only peer"
      checked={ticketData.trackInventory}
      onChange={(e:any) => setTicketData({ ...ticketData, trackInventory: e.target.checked })}
    />
    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:w-5 after:h-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
    <span className="ml-3 text-sm font-medium text-white dark:text-white">
      {ticketData.trackInventory ? 'YES' : 'NO'}
    </span>
  </label>
</div>

<div className="mb-4">
    <label htmlFor="inventoryQuantity" className="block text-sm font-medium mb-1">Quantity</label>
    <input
      type="number"
      id="inventoryQuantity"
      name="inventoryQuantity"
      value={ticketData.inventoryQuantity}
      onChange={handleInputChange}
      min="0"
      className="block w-full p-2 text-sm bg-gray-700 text-white rounded focus:outline-none"
    />
  </div>


{/* Custom Fields Section */}
<div className="bg-gray-800 text-white p-4 rounded">
  <div className="mb-4">
    <label htmlFor="tripType" className="block text-sm font-medium mb-2">Trip Type</label>
    <select
      id="tripType"
      name="tripType"
      value={tripType}
      onChange={e => setTripType(e.target.value)}
      className="block w-full p-2 text-sm bg-gray-700 rounded focus:outline-none"
    >
      <option value="" disabled>Select an option</option>
      <option value="Round Trip">Round Trip</option>
      <option value="One Way">One Way</option>
      <option value="Charter">Charter</option>
      {/* More options can be added here */}
    </select>
  </div>

  <div className="mb-4">
    <label htmlFor="lineName" className="block text-sm font-medium mb-2">Line Name <span className='text-red-500'>*</span></label>
    <select
      id="lineName"
      name="lineName"
      value={lineName}
      onChange={e => setLineName(e.target.value)}
      className="block w-full p-2 text-sm bg-gray-700 rounded focus:outline-none"
    >
      {/* Options will be fetched from the backend */}
      {lines.map((line) => (
        <option key={line._id} value={line.name}>
          {line.name}
        </option>
      ))}
    </select>
  </div>

{/* Departure Date */}
<div className="mb-4">
  <label htmlFor="departureDate" className="block text-sm font-medium text-white mb-2">Departure Date</label>
  <input
    id="departureDate"
    type="datetime-local"
    name="departureDate"
    value={departureDate}
    onChange={e => setDepartureDate(e.target.value)}
    className="block w-full p-2 text-sm bg-gray-700 rounded focus:outline-none"
  />
</div>

{/* Return Date */}
<div className="mb-4">
  <label htmlFor="returnDate" className="block text-sm font-medium text-white mb-2">Return Date</label>
  <input
    id="returnDate"
    type="datetime-local"
    name="returnDate"
    value={returnDate}
    onChange={e => setReturnDate(e.target.value)}
    className="block w-full p-2 text-sm bg-gray-700 rounded focus:outline-none"
  />
</div>



  {/* Stops Input */}
<div className="mb-4">
  <label htmlFor="stops" className="block text-sm font-medium mb-2">Stops</label>
  <input
    id="stops"
    type="text"
    name="stops"
    value={ticketData.stops} // Assuming you have 'stops' state in ticketData
    onChange={handleInputChange}
    placeholder="e.g., Commack, Hicksville, Fresh Meadows"
    className="block w-full p-2 text-sm bg-gray-700 rounded focus:outline-none"
  />
</div>

{/* 1st Pick Up Time */}
<div className="mb-4">
  <label htmlFor="firstPickUpTime" className="block text-sm font-medium mb-2">1st Pick Up Time</label>
  <input
    id="firstPickUpTime"
    type="datetime-local"
    name="firstPickUpTime"
    value={ticketData.firstPickUpTime} // Assuming you have 'firstPickUpTime' state in ticketData
    onChange={handleInputChange}
    className="block w-full p-2 text-sm bg-gray-700 rounded focus:outline-none"
  />
</div>

{/* 1st Pick Up Location Text Area */}
<div className="mb-4">
  <label htmlFor="firstPickUpLocation" className="block text-sm font-medium mb-2">1st Pick Up Location</label>
  <textarea
    id="firstPickUpLocation"
    name="firstPickUpLocation"
    value={ticketData.firstPickUpLocation} // Assuming you have 'firstPickUpLocation' state in ticketData
    onChange={handleInputChange}
    placeholder="Enter the first pick up location"
    rows="3"
    className="block w-full p-2 text-sm bg-gray-700 rounded focus:outline-none"
  ></textarea>
</div>

 {/* Second Pick Up Time Input */}
 <div className="mb-4">
    <label htmlFor="secondPickUpTime" className="block text-sm font-medium mb-2">2nd Pick Up Time</label>
    <input
      id="secondPickUpTime"
      type="datetime-local"
      name="secondPickUpTime"
      value={secondPickUpTime}
      onChange={e => setSecondPickUpTime(e.target.value)}
      className="block w-full p-2 text-sm bg-gray-700 rounded focus:outline-none"
    />
  </div>

  {/* Second Pick Up Location Input */}
  <div className="mb-4">
    <label htmlFor="secondPickUpLocation" className="block text-sm font-medium mb-2">2nd Pick Up Location</label>
    <textarea
      id="secondPickUpLocation"
      name="secondPickUpLocation"
      value={secondPickUpLocation}
      onChange={e => setSecondPickUpLocation(e.target.value)}
      placeholder="Enter the second pick up location"
      rows="3"
      className="block w-full p-2 text-sm bg-gray-700 rounded focus:outline-none"
    ></textarea>
  </div>

 {/* 3rd Pick Up Time Input */}
 <div className="mb-4">
    <label htmlFor="thirdPickUpTime" className="block text-sm font-medium mb-2">3rd Pick Up Time</label>
    <input
      id="thirdPickUpTime"
      type="datetime-local"
      name="thirdPickUpTime"
      value={secondPickUpTime}
      onChange={e => setThirdPickUpTime(e.target.value)}
      className="block w-full p-2 text-sm bg-gray-700 rounded focus:outline-none"
    />
  </div>

  {/* 3rd Pick Up Location Input */}
  <div className="mb-4">
    <label htmlFor="thirdPickUpLocation" className="block text-sm font-medium mb-2">3rd Pick Up Location</label>
    <textarea
      id="thirdPickUpLocation"
      name="thirdPickUpLocation"
      value={thirdPickUpLocation}
      onChange={e => setThirdPickUpLocation(e.target.value)}
      placeholder="Enter the second pick up location"
      rows="3"
      className="block w-full p-2 text-sm bg-gray-700 rounded focus:outline-none"
    ></textarea>
  </div>


 {/* Final Pick Up Time Input */}
 <div className="mb-4">
    <label htmlFor="finalPickUpTime" className="block text-sm font-medium mb-2">Final Pick Up Time</label>
    <input
      id="finalPickUpTime"
      type="datetime-local"
      name="finalPickUpTime"
      value={finalPickUpTime}
      onChange={e => setSecondPickUpTime(e.target.value)}
      className="block w-full p-2 text-sm bg-gray-700 rounded focus:outline-none"
    />
  </div>

  {/* Final Pick Up Location Input */}
  <div className="mb-4">
    <label htmlFor="finalPickUpLocation" className="block text-sm font-medium mb-2">Final Pick Up Location</label>
    <textarea
      id="finalPickUpLocation"
      name="finalPickUpLocation"
      value={secondPickUpLocation}
      onChange={e => setFinalPickUpLocation(e.target.value)}
      placeholder="Enter the Final pick up location"
      rows="3"
      className="block w-full p-2 text-sm bg-gray-700 rounded focus:outline-none"
    ></textarea>
  </div>

  {/* First Drop Off Location Input */}
<div className="mb-4">
  <label htmlFor="firstDropOffLocation" className="block text-sm font-medium mb-2">1st Drop Off Location</label>
  <input
    id="firstDropOffLocation"
    type="text"
    name="firstDropOffLocation"
    value={firstDropOffLocation}
    onChange={e => setFirstDropOffLocation(e.target.value)}
    placeholder="Enter the first drop off location"
    className="block w-full p-2 text-sm bg-gray-700 rounded focus:outline-none"
  />
</div>

{/* Second Drop Off Location Input */}
<div className="mb-4">
  <label htmlFor="secondDropOffLocation" className="block text-sm font-medium mb-2">2nd Drop Off Location</label>
  <input
    id="secondDropOffLocation"
    type="text"
    name="secondDropOffLocation"
    value={secondDropOffLocation}
    onChange={e => setSecondDropOffLocation(e.target.value)}
    placeholder="Enter the first drop off location"
    className="block w-full p-2 text-sm bg-gray-700 rounded focus:outline-none"
  />
</div>

{/* 3rd Drop Off Location Input */}
<div className="mb-4">
  <label htmlFor="secondDropOffLocation" className="block text-sm font-medium mb-2">3rd Drop Off Location</label>
  <input
    id="thirdDropOffLocation"
    type="text"
    name="thirdDropOffLocation"
    value={thirdDropOffLocation}
    onChange={e => setThirdDropOffLocation(e.target.value)}
    placeholder="Enter the first drop off location"
    className="block w-full p-2 text-sm bg-gray-700 rounded focus:outline-none"
  />
</div>

{/* Final Drop Off Location Input */}
<div className="mb-4">
  <label htmlFor="secondDropOffLocation" className="block text-sm font-medium mb-2">Final Drop Off Location</label>
  <input
    id="finalDropOffLocation"
    type="text"
    name="finalDropOffLocation"
    value={finalDropOffLocation}
    onChange={e => setFinalDropOffLocation(e.target.value)}
    placeholder="Enter the first drop off location"
    className="block w-full p-2 text-sm bg-gray-700 rounded focus:outline-none"
  />
</div>

{/* Suggested Tip for Driver Input */}
<div className="mb-4">
  <label htmlFor="suggestedTipForDriver" className="block text-sm font-medium mb-2">Suggested Tip For Driver</label>
  <input
    id="suggestedTipForDriver"
    type="number"
    name="suggestedTipForDriver"
    value={suggestedTipForDriver}
    onChange={e => setSuggestedTipForDriver(e.target.value)}
    placeholder="Suggested tip amount"
    className="block w-full p-2 text-sm bg-gray-700 rounded focus:outline-none"
  />
</div>

{/* 1st Pick Up Time (Return) Input */}
<div className="mb-4">
  <label htmlFor="firstPickUpTimeReturn" className="block text-sm font-medium mb-2">1st Pick Up Time (Return)</label>
  <input
    id="firstPickUpTimeReturn"
    type="datetime-local"
    name="firstPickUpTimeReturn"
    value={firstPickUpTimeReturn} // Update this with your state
    onChange={e => setFirstPickUpTimeReturn(e.target.value)} // Update this with your handler
    className="block w-full p-2 text-sm bg-gray-700 rounded focus:outline-none"
  />
</div>

{/* 1st Pick Up Location (Return) Text Area */}
<div className="mb-4">
  <label htmlFor="firstPickUpLocationReturn" className="block text-sm font-medium mb-2">1st Pick Up Location (Return)</label>
  <textarea
    id="firstPickUpLocationReturn"
    name="firstPickUpLocationReturn"
    value={firstPickUpLocationReturn} // Update this with your state
    onChange={e => setFirstPickUpLocationReturn(e.target.value)} // Update this with your handler
    placeholder="Enter the first pick up location for the return journey"
    rows="3"
    className="block w-full p-2 text-sm bg-gray-700 rounded focus:outline-none"
  ></textarea>
</div>

{/* 2nd Pick Up Time (Return) Input */}
<div className="mb-4">
  <label htmlFor="secondPickUpTimeReturn" className="block text-sm font-medium mb-2">2nd Pick Up Time (Return)</label>
  <input
    id="secondPickUpTimeReturn"
    type="datetime-local"
    name="secondPickUpTimeReturn"
    value={secondPickUpTimeReturn} // Update this with your state
    onChange={e => setSecondPickUpTimeReturn(e.target.value)} // Update this with your handler
    className="block w-full p-2 text-sm bg-gray-700 rounded focus:outline-none"
  />
</div>

{/* 2nd Pick Up Location (Return) Text Area */}
<div className="mb-4">
  <label htmlFor="secondPickUpLocationReturn" className="block text-sm font-medium mb-2">2nd Pick Up Location (Return)</label>
  <textarea
    id="secondPickUpLocationReturn"
    name="secondPickUpLocationReturn"
    value={secondPickUpLocationReturn} // Update this with your state
    onChange={e => setSecondPickUpLocationReturn(e.target.value)} // Update this with your handler
    placeholder="Enter the second pick up location for the return journey"
    rows="3"
    className="block w-full p-2 text-sm bg-gray-700 rounded focus:outline-none"
  ></textarea>
</div>

{/* 3rd Pick Up Time (Return) Input */}
<div className="mb-4">
  <label htmlFor="secondPickUpTimeReturn" className="block text-sm font-medium mb-2">3rd Pick Up Time (Return)</label>
  <input
    id="thirdPickUpTimeReturn"
    type="datetime-local"
    name="thirdPickUpTimeReturn"
    value={thirdPickUpTimeReturn} // Update this with your state
    onChange={e => setThirdPickUpTimeReturn(e.target.value)} // Update this with your handler
    className="block w-full p-2 text-sm bg-gray-700 rounded focus:outline-none"
  />
</div>

{/* 3rd Pick Up Location (Return) Text Area */}
<div className="mb-4">
  <label htmlFor="thirdPickUpLocationReturn" className="block text-sm font-medium mb-2">3rd Pick Up Location (Return)</label>
  <textarea
    id="thirdPickUpLocationReturn"
    name="thirdPickUpLocationReturn"
    value={thirdPickUpLocationReturn} // Update this with your state
    onChange={e => setThirdPickUpLocationReturn(e.target.value)} // Update this with your handler
    placeholder="Enter the second pick up location for the return journey"
    rows="3"
    className="block w-full p-2 text-sm bg-gray-700 rounded focus:outline-none"
  ></textarea>
</div>

{/* Final Pick Up Time (Return) Input */}
<div className="mb-4">
  <label htmlFor="secondPickUpTimeReturn" className="block text-sm font-medium mb-2">Final Pick Up Time (Return)</label>
  <input
    id="finalPickUpTimeReturn"
    type="datetime-local"
    name="finalPickUpTimeReturn"
    value={finalPickUpTimeReturn} // Update this with your state
    onChange={e => setFinalPickUpTimeReturn(e.target.value)} // Update this with your handler
    className="block w-full p-2 text-sm bg-gray-700 rounded focus:outline-none"
  />
</div>

{/* Final Pick Up Location (Return) Text Area */}
<div className="mb-4">
  <label htmlFor="thirdPickUpLocationReturn" className="block text-sm font-medium mb-2">Final Pick Up Location (Return)</label>
  <textarea
    id="finalPickUpLocationReturn"
    name="finalPickUpLocationReturn"
    value={finalPickUpLocationReturn} // Update this with your state
    onChange={e => setFinalPickUpLocationReturn(e.target.value)} // Update this with your handler
    placeholder="Enter the second pick up location for the return journey"
    rows="3"
    className="block w-full p-2 text-sm bg-gray-700 rounded focus:outline-none"
  ></textarea>
</div>

  {/* 1st Drop Off Location (Return) Input */}
<div className="mb-4">
  <label htmlFor="firstDropOffLocationReturn" className="block text-sm font-medium mb-2">1st Drop Off Location (Return)</label>
  <textarea
    id="firstDropOffLocationReturn"
    name="firstDropOffLocationReturn"
    value={firstDropOffLocationReturn}
    onChange={e => setFirstDropOffLocationReturn(e.target.value)}
    placeholder="Enter the first drop off location for the return journey"
    rows="3"
    className="block w-full p-2 text-sm bg-gray-700 rounded focus:outline-none"
  ></textarea>
</div>

{/* 2nd Drop Off Location (Return) Input */}
<div className="mb-4">
  <label htmlFor="secondDropOffLocationReturn" className="block text-sm font-medium mb-2">2nd Drop Off Location (Return)</label>
  <textarea
    id="secondDropOffLocationReturn"
    name="secondDropOffLocationReturn"
    value={secondDropOffLocationReturn}
    onChange={e => setSecondDropOffLocationReturn(e.target.value)}
    placeholder="Enter the second drop off location for the return journey"
    rows="3"
    className="block w-full p-2 text-sm bg-gray-700 rounded focus:outline-none"
  ></textarea>
</div>

{/* 3rd Drop Off Location (Return) Input */}
<div className="mb-4">
  <label htmlFor="thirdDropOffLocationReturn" className="block text-sm font-medium mb-2">3rd Drop Off Location (Return)</label>
  <textarea
    id="thirdDropOffLocationReturn"
    name="thirdDropOffLocationReturn"
    value={thirdDropOffLocationReturn}
    onChange={e => setThirdDropOffLocationReturn(e.target.value)}
    placeholder="Enter the third drop off location for the return journey"
    rows="3"
    className="block w-full p-2 text-sm bg-gray-700 rounded focus:outline-none"
  ></textarea>
</div>

{/* Final Drop Off Location (Return) Input */}
<div className="mb-4">
  <label htmlFor="finalDropOffLocationReturn" className="block text-sm font-medium mb-2">Final Drop Off Location (Return)</label>
  <textarea
    id="finalDropOffLocationReturn"
    name="finalDropOffLocationReturn"
    value={finalDropOffLocationReturn}
    onChange={e => setFinalDropOffLocationReturn(e.target.value)}
    placeholder="Enter the final drop off location for the return journey"
    rows="3"
    className="block w-full p-2 text-sm bg-gray-700 rounded focus:outline-none"
  ></textarea>
</div>

{/* Suggested Tip for Driver (Return) Input */}
<div className="mb-4">
  <label htmlFor="suggestedTipForDriverReturn" className="block text-sm font-medium mb-2">Suggested Tip For Driver (Return)</label>
  <input
    id="suggestedTipForDriverReturn"
    type="number"
    name="suggestedTipForDriverReturn"
    value={suggestedTipForDriverReturn}
    onChange={e => setSuggestedTipForDriverReturn(e.target.value)}
    placeholder="Suggested tip amount for the return journey"
    className="block w-full p-2 text-sm bg-gray-700 rounded focus:outline-none"
  />
</div>

  </div>
  </form>
</main>

)}


{isLineListVisible && (
  <>
   <div className={`flex flex-col ${isLineFormVisible ? 'w-1/3' : 'w-full'} bg-gray-800 text-white`}>
      {/* Header with buttons */}
      {!isLineFormVisible && (
      <div className="flex justify-between items-center p-4">
        <h2 className="text-xl font-bold">Lines</h2>
        <div className="flex space-x-2">
          <input type="text" placeholder="Search lines..." className="text-sm rounded p-2 bg-gray-700" />
          <button className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">Filter</button>
          <button className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">Select</button>
          <button className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">Export</button>
          <button className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">Import</button>
          <button className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">Settings</button>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            onClick={() => setIsLineFormVisible(true)}
          >
            + New Line
          </button>
        </div>
      </div>
    )}

      {/* Lines table */}
      <div className="overflow-x-auto">
      <table className="min-w-full text-sm divide-y divide-gray-200">
          {isLineFormVisible ? (
            <thead>
              <tr>
                <th className="px-4 py-2 font-medium text-left text-white whitespace-nowrap">Name</th>
              </tr>
            </thead>
            ) : (
              <thead>
                <tr>
                  <th className="px-4 py-2 font-medium text-left text-white whitespace-nowrap">Name</th>
                  <th className="px-4 py-2 font-medium text-left text-white whitespace-nowrap">Status</th>
                  <th className="px-4 py-2 font-medium text-left text-white whitespace-nowrap">Products</th>
                  <th className="px-4 py-2 font-medium text-left text-white whitespace-nowrap">Modified</th>
                  <th className="px-4 py-2 font-medium text-left text-white whitespace-nowrap">Published</th>
                </tr>
              </thead>
            )}
          <tbody className="divide-y divide-gray-200">
  {loading ? (
    // Render multiple skeleton rows to match the expected number of data rows
    [...Array(5)].map((_, index) => (
      <tr key={`skeleton-${index}`}>
        <td colSpan="5" className="text-center py-4">
          <div role="status" className="animate-pulse">
            <div className="h-3.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
            <div className="h-3 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[800px] mb-2.5"></div>
            <div className="h-3 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
            <div className="h-3 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[900px] mb-2.5"></div>
            <div className="h-3 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[950px] mb-2.5"></div>
            <div className="h-3 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[750px]"></div>
            <span className="sr-only">Loading...</span>
          </div>
        </td>
      </tr>
    ))
  ) : lines && lines.length > 0 ? (
    lines.map((line, index) => (
      line && line.name ? (
        <tr key={line._id || index} className={`${index % 2 === 0 ? 'bg-gray-700' : 'bg-gray-800'}`} onClick={() => handleEditLineClick(line)}>
          <td className="px-4 py-2 text-white whitespace-nowrap">{line.name}</td>
          {!isLineFormVisible && (
            <>
              <td className="px-4 py-2 text-white whitespace-nowrap">{line.status}</td>
              <td className="px-4 py-2 text-white whitespace-nowrap">{line.productsCount}</td>
              <td className="px-4 py-2 text-white whitespace-nowrap">
                {line.lastEdited ? new Date(line.lastEdited).toLocaleString() : 'Not Edited'}
              </td>
              <td className="px-4 py-2 text-white whitespace-nowrap">
                {line.created ? new Date(line.created).toLocaleString() : 'Not Published'}
              </td>
            </>
          )}
        </tr>
      )  : (
        <tr key={`empty-${index}`}>
          <td colSpan="5" className="text-center py-2 text-white">Line data is missing</td>
        </tr>
      )
    ))
  ) : (
    <tr>
      <td colSpan="5" className="text-center py-2 text-white">
        No lines available.
      </td>
    </tr>
  )}
</tbody>


    </table>
  </div>
</div> 
</>
)}

{isLineFormVisible && (
  <main className="w-full bg-gray-800 text-white p-4 overflow-y-auto">
    <div className="h-full bg-gray-800 p-6 rounded-lg shadow-lg">
    <div className="flex items-center justify-between mb-8">
  {/* Back arrow and title */}
  <div className="flex items-center">
  <button
  className="text-white p-2 bg-gray-800 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600 flex items-center justify-center"
  onClick={() => setIsLineFormVisible(false)}
  style={{ width: '64px', height: '64px' }} // Set the button size explicitly if you need a square button
>
  {/* Back arrow icon */}
  <svg className="w-6 h-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
  </svg>
</button>
    <h2 className="text-xl font-semibold text-white">{lineTitle || 'New Line'}</h2>
  </div>

  {/* Action Buttons */}
<div className="flex relative text-left">
  {/* Cancel button */}
  <button
          className="text-white bg-red-600 hover:bg-red-700 focus:ring-red-500 focus:ring-offset-red-200 transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg px-5 py-2"
          onClick={() => setIsLineFormVisible(false)}
        >
          Cancel
        </button>

  <button
    type="submit"
    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
    className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-gray-900 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-gray-700"
    id="menu-button"
    aria-expanded="true"
    aria-haspopup="true"
  >
    {editMode ? 'Save' : 'Create'}
    <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M5.292 7.292a1 1 0 011.414 0L10 10.586l3.294-3.294a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  </button>

  {/* Dropdown menu, show/hide based on menu state. */}
<div
  ref={lineDropDownRef}
  className={`${isDropdownOpen ? '' : 'hidden'} origin-top-right absolute right-0 mt-10 w-56 rounded-md shadow-lg bg-gray-900 ring-1 ring-black ring-opacity-5 focus:outline-none`}
  role="menu"
  aria-orientation="vertical"
  aria-labelledby="menu-button"
  tabIndex="-1"
>
<div className="relative py-1" role="none">
  {/* Button for Publish */}
  <div className="group">
    <button
      onClick={() => {
        setLastAction('publish');
        handleLineSubmit();
      }}
      className="text-white block w-full px-4 py-2 text-left text-sm hover:bg-gray-700 relative"
      role="menuitem"
      tabIndex="-1"
      id="menu-item-0"
    >
      Publish
    </button>
    <div className="absolute hidden group-hover:block px-2 py-1 text-sm text-white bg-black rounded-md shadow-lg -bottom-10 w-56">
      Publish the item to your live site.
    </div>
  </div>

  {/* Button for Save as draft */}
  <div className="group mt-1">
    <button
      onClick={() => {
        setLastAction('draft');
        handleLineSubmit();
      }}
      className="text-white block w-full px-4 py-2 text-left text-sm hover:bg-gray-700 relative"
      role="menuitem"
      tabIndex="-1"
      id="menu-item-1"
    >
      Save as draft
    </button>
    <div className="absolute hidden group-hover:block px-2 py-1 text-sm text-white bg-black rounded-md shadow-lg -bottom-10 w-56">
      Save the item without publishing it.
    </div>
  </div>
</div>
</div>
</div>
</div>


      <form onSubmit={handleLineSubmit} className="space-y-6">
        {/* Line Name Input */}
        <div>
          <label className="block text-sm font-medium text-white mb-1" htmlFor="line-name">Name <span className="text-red-700">*</span></label>
          <input
            id="line-name"
            {...register('name', { required: 'Name is required' })}
            required
            className="w-full p-2 border bg-black border-gray-300 rounded-md focus:outline-none focus:ring-gray-500 focus:border-gray-500"
            placeholder="Line Name"
            value={newLine.name}
            onChange={handleNameChange}
          />
          {errors.name && <p className="text-red-500">{errors.name.message}</p>}
        </div>

        {/* Slug Input */}
      <div>
        <label className="block text-sm font-medium text-white mb-1" htmlFor="slug">Slug <span className="text-red-700">*</span></label>
        <input
          id="slug"
          {...register('slug', { required: 'Slug is required' })}
          className="w-full p-2 border bg-black border-gray-300 rounded-md focus:outline-none focus:ring-gray-500 focus:border-gray-500"
          value={newLine.slug || ''} // Use value for controlled input
          onChange={handleSlugChange} // Update the slug state when user edits the slug
          placeholder="slug" // This will only show when newLine.slug is empty
        />
        {errors.slug && <span className="text-red-500">{errors.slug.message}</span>}
        <p className="text-white mt-2">www.tri-statecoach.com/category/{newLine.slug || 'slug'}</p>
      </div>



        {/* Products Dropdown */}
<div className="flex flex-col space-y-4">
  <div className="flex flex-wrap">

  </div>
  <div>
    <label htmlFor="products" className="block mb-2 text-sm font-medium text-white">Products</label>
    <Multiselect
  options={tickets}
  selectedValues={selectedProducts}
  onSelect={(selectedList, selectedItem) => handleSelectProduct(selectedList, selectedItem)}
  onRemove={(selectedList, removedItem) => handleRemoveProduct(selectedList, removedItem)}
  displayValue="name"
  className="dark:bg-gray-800 dark:text-white dark:border-gray-700 w-full" // Updated dark theme classes for the component
  style={{

    multiselectContainer: {
      // Styles for the container of the multiselect
      width: '100%',
      backgroundColor: '#1F2937', // Dark background color for the container
    },
    searchBox: {
      // Styles for the search input box
      minWidth: '100%',
      border: '2px solid #4B5563', // Bottom border color for dark theme
      borderRadius: '0px',
      backgroundColor: '#1F2937', // Dark background color for the search box
      color: 'white', // Text color for dark theme
      paddingLeft: '0.5rem', // Space before text
      paddingRight: '2.5rem', // Space after text for the search icon
    },
    optionContainer: {
      // Styles for the dropdown options container
      width: '100%',
      backgroundColor: '#1F2937', // Dark background color for options container
      borderColor: '#374151', // Border color for the options container
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', // Subtle shadow for depth
    },
    option: {
      // Styles for each dropdown option
      
      backgroundColor: 'rgb(38 38 38)', // Blue background color for selected option
      color: 'white', // Text color for options
      '&:hover': {
        backgroundColor: 'black', // Lighter blue background color on hover
      },
    },
    // ... add other necessary style objects
  }}
/>

  </div>
</div>



      </form>
    </div>
  </main>
)}
</div>
    </>
  );
}
  
export default AdminDashboard;
