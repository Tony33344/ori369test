import { test, expect } from '@playwright/test';

test.describe('CMS System Testing - CRITICAL', () => {
  test.describe('CMS Implementation Analysis', () => {
    test('Analyze CMS implementations in codebase', async ({ page }) => {
      // 🔴 CRITICAL TEST: Detect multiple CMSManager implementations
      await page.goto('/admin');
      
      // Check for admin authentication requirement
      const loginForm = page.locator('[data-testid="login-form"], .login-form');
      const isLoginRequired = await loginForm.isVisible();
      
      if (isLoginRequired) {
        // Login as admin
        await page.fill('input[name="email"]', 'admin@example.com');
        await page.fill('input[name="password"]', 'admin123');
        await page.click('button[type="submit"]');
        await page.waitForURL('/admin');
      }
      
      // Wait for CMS interface to load
      await page.waitForLoadState('networkidle');
      
      // 🔍 ANALYZE: Check for multiple CMS implementations
      const cmsAnalysis = await page.evaluate(() => {
        const scripts = Array.from(document.querySelectorAll('script'));
        const cmsScripts = scripts.filter(script => 
          script.innerHTML.includes('CMSManager')
        );
        
        const cmsVariants = [
          'CMSManager',
          'CMSManagerWorking', 
          'CMSManagerFixed',
          'CMSManagerNew',
          'CMSManagerSimple',
          'CMSManagerWithImages'
        ];
        
        const foundVariants = cmsVariants.filter(variant => 
          cmsScripts.some(script => script.innerHTML.includes(variant)) ||
          window[variant] !== undefined
        );
        
        return {
          totalScripts: cmsScripts.length,
          foundVariants,
          issue: foundVariants.length > 1 ? 'MULTIPLE_CMS_IMPLEMENTATIONS' : 'SINGLE_CMS'
        };
      });
      
      console.log('🔍 CMS Implementation Analysis:');
      console.log(`- Total CMS-related scripts: ${cmsAnalysis.totalScripts}`);
      console.log(`- CMS variants found: ${cmsAnalysis.foundVariants.join(', ')}`);
      console.log(`- Status: ${cmsAnalysis.issue}`);
      
      if (cmsAnalysis.issue === 'MULTIPLE_CMS_IMPLEMENTATIONS') {
        console.log('❌ CRITICAL ISSUE CONFIRMED: Multiple CMS implementations detected');
        console.log('Found CMS variants:', cmsAnalysis.foundVariants);
        console.log('This confirms the critical issue from gap analysis');
      } else {
        console.log('✅ Single CMS implementation (good)');
      }
    });

    test('CMS Manager accessibility', async ({ page }) => {
      // Try to access CMS
      await page.goto('/admin');
      
      // Check if admin area is protected
      const isProtected = await page.locator('input[name="email"]').isVisible();
      
      if (isProtected) {
        console.log('✅ Admin area properly protected by authentication');
        
        // Login to access CMS
        await page.fill('input[name="email"]', 'admin@example.com');
        await page.fill('input[name="password"]', 'admin123');
        await page.click('button[type="submit"]');
        await page.waitForURL('/admin');
      }
      
      // Wait for CMS interface
      await page.waitForTimeout(2000);
      
      // Check for CMS interface elements
      const cmsInterface = page.locator('[data-testid="cms-manager"], .cms-manager, .admin-interface');
      const isInterfaceVisible = await cmsInterface.isVisible();
      
      if (isInterfaceVisible) {
        console.log('✅ CMS interface loads correctly');
      } else {
        console.log('❌ CMS interface not found or not loading');
        
        // Debug: Check what's actually on the admin page
        const pageContent = await page.content();
        if (pageContent.includes('CMSManager')) {
          console.log('✅ CMSManager component found in page but may not be visible');
        } else {
          console.log('❌ No CMSManager component found in admin page');
        }
      }
    });
  });

  test.describe('CMS Content Management', () => {
    test.beforeEach(async ({ page }) => {
      // Login as admin for CMS tests
      await page.goto('/admin');
      
      if (await page.locator('input[name="email"]').isVisible()) {
        await page.fill('input[name="email"]', 'admin@example.com');
        await page.fill('input[name="password"]', 'admin123');
        await page.click('button[type="submit"]');
        await page.waitForURL('/admin');
        await page.waitForTimeout(2000);
      }
    });

    test('CMS Pages CRUD operations', async ({ page }) => {
      // Test creating a new page
      const addPageButton = page.locator('[data-testid="add-page"], .add-page, button:has-text("Add")');
      
      if (await addPageButton.isVisible()) {
        await addPageButton.click();
        
        // Fill page form
        const titleField = page.locator('input[name="title"], [data-testid="page-title"]');
        const slugField = page.locator('input[name="slug"], [data-testid="page-slug"]');
        
        if (await titleField.isVisible()) {
          const testTitle = `Test Page ${Date.now()}`;
          const testSlug = `test-page-${Date.now()}`;
          
          await titleField.fill(testTitle);
          await slugField.fill(testSlug);
          
          // Save page
          const saveButton = page.locator('button[type="submit"], [data-testid="save-page"]');
          await saveButton.click();
          
          // Check for success message
          const successMessage = page.locator('.success-message, [data-testid="success"]');
          const hasSuccess = await successMessage.isVisible();
          
          if (hasSuccess) {
            console.log('✅ Page creation successful');
          } else {
            console.log('⚠️ Page creation result unclear');
          }
        } else {
          console.log('⚠️ Page form fields not found');
        }
      } else {
        console.log('❌ Add page button not found');
      }
    });

    test('CMS Sections management', async ({ page }) => {
      // Test section management
      const sectionsPanel = page.locator('[data-testid="sections-panel"], .sections-panel');
      
      if (await sectionsPanel.isVisible()) {
        console.log('✅ Sections panel found');
        
        // Test adding a section
        const addSectionButton = page.locator('[data-testid="add-section"], .add-section');
        
        if (await addSectionButton.isVisible()) {
          await addSectionButton.click();
          
          // Check if section editor appears
          const sectionEditor = page.locator('[data-testid="section-editor"], .section-editor');
          const hasEditor = await sectionEditor.isVisible();
          
          if (hasEditor) {
            console.log('✅ Section editor opens correctly');
          } else {
            console.log('⚠️ Section editor not found');
          }
        }
      } else {
        console.log('❌ Sections panel not found');
      }
    });

    test('CMS Content sanitization check', async ({ page }) => {
      // Test if content is properly sanitized
      const contentField = page.locator('textarea[name="content"], [data-testid="page-content"], .content-editor');
      
      if (await contentField.isVisible()) {
        // Try to input potentially malicious content
        const maliciousContent = '<script>alert("XSS")</script><p>Normal content</p>';
        await contentField.fill(maliciousContent);
        
        // Save and check if sanitized
        const saveButton = page.locator('button[type="submit"]');
        await saveButton.click();
        
        // Check if script tags are stripped (basic sanitization check)
        const pageContent = await page.content();
        const isSanitized = !pageContent.includes('<script>alert("XSS")</script>');
        
        if (isSanitized) {
          console.log('✅ Basic content sanitization appears to be working');
        } else {
          console.log('❌ CRITICAL: Content sanitization not working - XSS vulnerability');
        }
      }
    });
  });

  test.describe('CMS Data Model Consistency', () => {
    test('Check CMS data model consistency', async ({ page }) => {
      await page.goto('/admin');
      
      if (await page.locator('input[name="email"]').isVisible()) {
        await page.fill('input[name="email"]', 'admin@example.com');
        await page.fill('input[name="password"]', 'admin123');
        await page.click('button[type="submit"]');
        await page.waitForURL('/admin');
      }
      
      // Check if both data models exist (pages/sections vs blocks model)
      const dataModelAnalysis = await page.evaluate(() => {
        // Check for pages/sections model indicators
        const pagesModel = {
          hasPagesAPI: document.documentElement.innerHTML.includes('/api/cms/pages'),
          hasSectionsAPI: document.documentElement.innerHTML.includes('/api/cms/sections'),
          hasBlocksAPI: document.documentElement.innerHTML.includes('/api/cms/blocks')
        };
        
        return pagesModel;
      });
      
      console.log('🔍 CMS Data Model Analysis:');
      console.log(`- Pages API usage: ${dataModelAnalysis.hasPagesAPI}`);
      console.log(`- Sections API usage: ${dataModelAnalysis.hasSectionsAPI}`);
      console.log(`- Blocks API usage: ${dataModelAnalysis.hasBlocksAPI}`);
      
      if (dataModelAnalysis.hasPagesAPI && dataModelAnalysis.hasBlocksAPI) {
        console.log('❌ INCONSISTENT: Both pages/sections and blocks models detected');
        console.log('This indicates the CMS implementation chaos identified in gap analysis');
      } else if (dataModelAnalysis.hasBlocksAPI) {
        console.log('✅ Using blocks model (recommended)');
      } else if (dataModelAnalysis.hasPagesAPI) {
        console.log('✅ Using pages/sections model (acceptable)');
      } else {
        console.log('⚠️ CMS API usage unclear');
      }
    });
  });

  test.describe('CMS Admin Interface Usability', () => {
    test('CMS interface usability test', async ({ page }) => {
      await page.goto('/admin');
      
      if (await page.locator('input[name="email"]').isVisible()) {
        await page.fill('input[name="email"]', 'admin@example.com');
        await page.fill('input[name="password"]', 'admin123');
        await page.click('button[type="submit"]');
        await page.waitForURL('/admin');
      }
      
      // Check for interface consistency issues
      const interfaceIssues = [];
      
      // Check for multiple CMS interfaces
      const cmsElements = page.locator('[class*="cms"], [id*="cms"], [data-testid*="cms"]');
      const cmsCount = await cmsElements.count();
      
      if (cmsCount > 10) {
        interfaceIssues.push(`High number of CMS elements (${cmsCount}) - potential interface complexity`);
      }
      
      // Check for confusing navigation
      const navElements = page.locator('nav a, .nav a, .menu a');
      const navCount = await navElements.count();
      
      if (navCount > 8) {
        interfaceIssues.push(`Complex navigation (${navCount} links) - potential user confusion`);
      }
      
      if (interfaceIssues.length > 0) {
        console.log('⚠️ CMS Interface Issues Found:');
        interfaceIssues.forEach(issue => console.log(`  - ${issue}`));
      } else {
        console.log('✅ CMS interface appears clean and usable');
      }
    });
  });
});