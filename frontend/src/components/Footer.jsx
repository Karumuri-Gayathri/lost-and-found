const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white mt-12">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          <div>
            <h3 className="text-lg font-bold mb-4">Campus Lost & Found</h3>
            <p className="text-gray-300">Help your campus community find lost items and return found items to their owners.</p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-300">
              <li><a href="/lost-items" className="hover:text-white">Lost Items</a></li>
              <li><a href="/found-items" className="hover:text-white">Found Items</a></li>
              <li><a href="/login" className="hover:text-white">Login</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Contact</h3>
            <p className="text-gray-300">Email: support@lostfound.edu</p>
            <p className="text-gray-300">Phone: (555) 123-4567</p>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-6 text-center text-gray-300">
          <p>&copy; {currentYear} Campus Lost & Found. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
