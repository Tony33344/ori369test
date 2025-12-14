#!/bin/bash

# ORI369 Comprehensive Testing Execution Script
# This script runs the complete testing suite for the wellness center platform

set -e

echo "🏥 ORI369 Wellness Center Platform - Comprehensive Testing Suite"
echo "================================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_requirements() {
    print_status "Checking system requirements..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d 'v' -f 2 | cut -d '.' -f 1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ required. Current: $(node --version)"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    print_success "System requirements check passed"
}

# Install dependencies
install_dependencies() {
    print_status "Installing/updating dependencies..."
    npm install
    npx playwright install --with-deps
    print_success "Dependencies installed"
}

# Check environment variables
check_environment() {
    print_status "Checking environment configuration..."
    
    if [ ! -f ".env.local" ]; then
        print_warning "No .env.local file found. Creating from example..."
        if [ -f ".env.example" ]; then
            cp .env.example .env.local
            print_warning "Please configure .env.local with your Supabase credentials"
        else
            print_error "No .env.example file found"
            exit 1
        fi
    fi
    
    # Check if required environment variables are set
    source .env.local
    
    if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
        print_error "Supabase environment variables not configured"
        print_error "Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
        exit 1
    fi
    
    print_success "Environment configuration check passed"
}

# Setup test database
setup_test_database() {
    print_status "Setting up test database..."
    
    # Run database setup if the script exists
    if [ -f "setup-database.js" ]; then
        npm run setup:db
        print_success "Test database setup completed"
    else
        print_warning "Database setup script not found"
    fi
}

# Run specific test categories
run_homepage_tests() {
    print_status "Running homepage and navigation tests..."
    npx playwright test 01-homepage.spec.ts --reporter=list
}

run_authentication_tests() {
    print_status "Running authentication tests..."
    npx playwright test 02-authentication.spec.ts --reporter=list
}

run_cms_tests() {
    print_status "Running CMS system tests (CRITICAL)..."
    npx playwright test 03-cms-system.spec.ts --reporter=list
}

run_ecommerce_tests() {
    print_status "Running e-commerce tests (CRITICAL)..."
    npx playwright test 04-ecommerce.spec.ts --reporter=list
}

run_security_tests() {
    print_status "Running security tests (CRITICAL)..."
    npx playwright test security.spec.ts --reporter=list
}

run_booking_tests() {
    print_status "Running booking system tests..."
    npx playwright test 05-booking.spec.ts --reporter=list
}

# Generate test report
generate_report() {
    print_status "Generating comprehensive test report..."
    
    # Create test results directory if it doesn't exist
    mkdir -p test-results
    
    # Generate HTML report
    npx playwright show-report --output-dir=test-results/html-report
    
    print_success "Test report generated in test-results/html-report/"
}

# Main execution function
main() {
    echo "Starting ORI369 testing suite..."
    echo ""
    
    # Parse command line arguments
    case "${1:-all}" in
        "homepage")
            check_requirements
            check_environment
            run_homepage_tests
            ;;
        "auth")
            check_requirements
            check_environment
            run_authentication_tests
            ;;
        "cms")
            check_requirements
            check_environment
            setup_test_database
            run_cms_tests
            ;;
        "ecommerce")
            check_requirements
            check_environment
            setup_test_database
            run_ecommerce_tests
            ;;
        "security")
            check_requirements
            check_environment
            setup_test_database
            run_security_tests
            ;;
        "booking")
            check_requirements
            check_environment
            setup_test_database
            run_booking_tests
            ;;
        "report")
            check_requirements
            generate_report
            ;;
        "setup")
            check_requirements
            install_dependencies
            check_environment
            setup_test_database
            print_success "Setup completed! Run tests with: $0 [test-category]"
            ;;
        "all")
            check_requirements
            install_dependencies
            check_environment
            setup_test_database
            
            echo ""
            print_status "Running complete test suite..."
            echo ""
            
            # Run all test categories
            run_homepage_tests
            run_authentication_tests
            run_cms_tests
            run_ecommerce_tests
            run_security_tests
            run_booking_tests
            
            echo ""
            generate_report
            ;;
        "help"|"-h"|"--help")
            echo "ORI369 Testing Suite Usage:"
            echo "  $0 all        - Run complete test suite (default)"
            echo "  $0 homepage   - Run homepage and navigation tests"
            echo "  $0 auth       - Run authentication tests"
            echo "  $0 cms        - Run CMS system tests (CRITICAL)"
            echo "  $0 ecommerce  - Run e-commerce tests (CRITICAL)"
            echo "  $0 security   - Run security tests (CRITICAL)"
            echo "  $0 booking    - Run booking system tests"
            echo "  $0 setup      - Setup testing environment only"
            echo "  $0 report     - Generate test report from results"
            echo "  $0 help       - Show this help message"
            echo ""
            echo "Test Categories:"
            echo "  🔴 CRITICAL: CMS, E-commerce, Security tests"
            echo "  🟡 HIGH: Authentication, Booking tests"
            echo "  🟢 NORMAL: Homepage tests"
            ;;
        *)
            print_error "Unknown command: $1"
            print_error "Run '$0 help' for usage information"
            exit 1
            ;;
    esac
}

# Error handling
trap 'print_error "Testing failed! Check the output above for details."' ERR

# Run main function
main "$@"