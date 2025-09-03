

'use server';

import 'dotenv/config';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import type { Database } from 'sqlite';
import type { Dealer, Employee, Lead, SalarySlip, Vehicle, WebsiteContent } from './types';

let db: Database<sqlite3.Database, sqlite3.Statement> | null = null;
let initialized = false;

const placeholderImage = 'https://picsum.photos/600/400';
const placeholderAvatar = 'https://picsum.photos/100/100';

async function initializeDatabase(dbInstance: Database) {
  if (initialized) {
    return;
  }
  
  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS test_hits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      hit_time TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS dealers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      dealershipName TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      vehicleCategory TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('approved', 'pending', 'deactivated')),
      deactivationReason TEXT
    );
  `);

  // Ensure website_content is dropped and created correctly after dealers
  await dbInstance.exec(`DROP TABLE IF EXISTS website_content;`);
  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS website_content (
      dealerId TEXT PRIMARY KEY,
      brandName TEXT,
      logoUrl TEXT,
      tagline TEXT,
      aboutUs TEXT,
      contactPhone TEXT,
      contactEmail TEXT,
      address TEXT,
      activeTheme TEXT,
      websiteStatus TEXT DEFAULT 'not_requested' CHECK(websiteStatus IN ('not_requested', 'pending_approval', 'approved', 'rejected')),
      isLive BOOLEAN DEFAULT 0,
      FOREIGN KEY (dealerId) REFERENCES dealers(id) ON DELETE CASCADE
    );
  `);
    
  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id TEXT PRIMARY KEY,
      make TEXT,
      model TEXT,
      variant TEXT,
      year INTEGER,
      price REAL,
      cost REAL,
      refurbishmentCost REAL,
      status TEXT NOT NULL CHECK(status IN ('For Sale', 'Sold', 'In Refurbishment', 'Draft')),
      dateAdded TEXT,
      dealerId TEXT NOT NULL,
      manufacturingYear INTEGER,
      registrationNumber TEXT UNIQUE,
      vin TEXT,
      rtoState TEXT,
      ownershipType TEXT,
      fuelType TEXT,
      transmission TEXT,
      mileage INTEGER,
      odometerReading INTEGER,
      sellerName TEXT,
      sellerPhone TEXT,
      aadharFront TEXT,
      aadharBack TEXT,
      panFront TEXT,
      buyingDate TEXT,
      buyingPrice REAL,
      loanStatus TEXT,
      nocStatus TEXT,
      bankLfcLetter TEXT,
      bankNocLetter TEXT,
      foreclosureAmount REAL,
      foreclosurePaymentProof TEXT,
      amountPaidToSeller REAL,
      sellerPaymentMethod TEXT,
      sellerPaymentProof TEXT,
      images TEXT,
      spareTyreAvailability TEXT,
      rcImage TEXT,
      insuranceType TEXT,
      insuranceImage TEXT,
      insuranceValidUpto TEXT,
      ncbPercentage REAL,
      sellingPrice REAL,
      sellingDate TEXT,
      buyerName TEXT,
      buyerPhone TEXT,
      buyerAadharFront TEXT,
      buyerAadharBack TEXT,
      buyerPanFront TEXT,
      buyerPaymentMethod TEXT,
      buyerPaymentProof TEXT,
      FOREIGN KEY (dealerId) REFERENCES dealers (id) ON DELETE CASCADE
    );
  `);
    
  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS employees (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        role TEXT NOT NULL,
        salary REAL NOT NULL,
        avatarUrl TEXT,
        aadharImageUrl TEXT,
        dealerId TEXT NOT NULL,
        phone TEXT NOT NULL UNIQUE,
        password TEXT,
        joiningDate TEXT NOT NULL,
        FOREIGN KEY (dealerId) REFERENCES dealers (id) ON DELETE CASCADE
    );
  `);
    
  await dbInstance.exec(`DROP TABLE IF EXISTS leads;`);
  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS leads (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT,
        vehicleId TEXT,
        assignedTo TEXT,
        testDriveStatus TEXT NOT NULL,
        conversionStatus TEXT NOT NULL,
        dateAdded TEXT NOT NULL,
        dealerId TEXT NOT NULL,
        otherVehicleName TEXT,
        otherVehicleReg TEXT,
        isArchived INTEGER DEFAULT 0,
        FOREIGN KEY (dealerId) REFERENCES dealers (id) ON DELETE CASCADE,
        FOREIGN KEY (vehicleId) REFERENCES vehicles (id) ON DELETE SET NULL,
        FOREIGN KEY (assignedTo) REFERENCES employees (id) ON DELETE SET NULL
    );
  `);
    
  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS salarySlips (
      id TEXT PRIMARY KEY,
      employeeId TEXT NOT NULL,
      dealerId TEXT NOT NULL,
      month INTEGER NOT NULL,
      year INTEGER NOT NULL,
      baseSalary REAL NOT NULL,
      incentives REAL NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('Pending', 'Paid')),
      generatedDate TEXT NOT NULL,
      paidDate TEXT,
      UNIQUE(employeeId, month, year),
      FOREIGN KEY (dealerId) REFERENCES dealers (id) ON DELETE CASCADE,
      FOREIGN KEY (employeeId) REFERENCES employees (id) ON DELETE CASCADE
    );
  `);

  const adminCount = await dbInstance.get('SELECT COUNT(*) as count FROM dealers where email = ?', 'admin@trustedvehicles.com');
  if (adminCount?.count === 0) {
    await dbInstance.run(
        "INSERT INTO dealers (id, name, dealershipName, email, phone, password, city, state, vehicleCategory, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        'admin-user', 'Admin', 'Trusted Vehicles HQ', 'admin@trustedvehicles.com', '0000000000', 'password', 'Corporate', 'System', 'Four Wheeler', 'approved'
    );
    console.log("Admin user created.");
  }

  initialized = true;
}

export async function getDB() {
    if (!db) {
        db = await open({
            filename: 'src/lib/database.db',
            driver: sqlite3.Database
        });
        console.log('✅ Successfully connected to SQLite database!');
    }
    await initializeDatabase(db);
    return db;
}


export async function setupDatabase() {
    if (db) {
        await db.close();
        db = null;
    }
    const fs = require('fs').promises;
    try {
        await fs.unlink('src/lib/database.db');
        console.log('Database file removed.');
    } catch (err: any) {
        if (err.code !== 'ENOENT') {
            console.error('Error removing database file:', err);
            throw err;
        }
        console.log('Database file not found, skipping removal.');
    }

    console.log('Database flushed.');
    initialized = false;
    await getDB();
    console.log('Database re-initialized and seeded successfully.');
}


// DEALER FUNCTIONS
export async function getDealerByPhone(phone: string): Promise<Dealer | undefined> {
    const db = await getDB();
    return db.get('SELECT * FROM dealers WHERE phone = ?', phone);
}

export async function getDealerByEmail(email: string): Promise<Dealer | undefined> {
    const db = await getDB();
    return db.get('SELECT * FROM dealers WHERE email = ?', email);
}

export async function getDealerById(id: string): Promise<Dealer | undefined> {
    const db = await getDB();
    return db.get('SELECT * FROM dealers WHERE id = ?', id);
}

export async function checkExistingUser(phone: string, email: string): Promise<boolean> {
    const db = await getDB();
    const result = await db.get('SELECT 1 FROM dealers WHERE phone = ? OR (email = ? AND email != \'\')', phone, email);
    return !!result;
}

export async function addDealer(dealer: Omit<Dealer, 'id' | 'status'>) {
    const db = await getDB();
    const id = crypto.randomUUID();
    const status = 'pending'; // Default status

    await db.run(
        `INSERT INTO dealers (id, name, dealershipName, email, phone, password, city, state, vehicleCategory, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        id,
        dealer.name,
        dealer.dealershipName,
        dealer.email,
        dealer.phone,
        dealer.password,
        dealer.city,
        dealer.state,
        dealer.vehicleCategory,
        status
    );
}

export async function updateDealerDb(dealerId: string, data: Partial<Omit<Dealer, 'id'>>): Promise<{ success: boolean; error?: string }> {
    const db = await getDB();
    try {
        const fields = Object.keys(data).filter(key => (data as any)[key] !== undefined && (key !== 'password' || (key === 'password' && (data as any)[key])));
        if (fields.length === 0) {
            return { success: true }; // Nothing to update
        }

        const setClause = fields.map((field) => `${field} = ?`).join(', ');
        const values = fields.map(field => (data as any)[field]);

        const result = await db.run(`UPDATE dealers SET ${setClause} WHERE id = ?`, [...values, dealerId]);
        
        if (result.changes === 0) {
            return { success: false, error: 'Dealer not found or no changes made.' };
        }

        return { success: true };
    } catch (error: any) {
        console.error('Error updating dealer:', error);
        if (error.code === 'SQLITE_CONSTRAINT') {
             return { success: false, error: "A dealer with this email or phone number may already exist." };
        }
        return { success: false, error: 'Failed to update dealer due to a database error.' };
    }
}


// WEBSITE CONTENT FUNCTIONS
export async function getWebsiteContent(dealerId: string): Promise<WebsiteContent | null> {
    const db = await getDB();
    const [websiteContent, dealerInfo] = await Promise.all([
      db.get('SELECT * FROM website_content WHERE dealerId = ?', dealerId),
      getDealerById(dealerId)
    ]);
  
    if (!dealerInfo) {
      return null; // or handle as an error, dealer must exist
    }

    // Return merged data, with website_content taking precedence
    return {
      dealerId: dealerId,
      brandName: websiteContent?.brandName ?? dealerInfo.dealershipName,
      logoUrl: websiteContent?.logoUrl ?? null,
      tagline: websiteContent?.tagline ?? null,
      aboutUs: websiteContent?.aboutUs ?? null,
      contactPhone: websiteContent?.contactPhone ?? dealerInfo.phone,
      contactEmail: websiteContent?.contactEmail ?? dealerInfo.email,
      address: websiteContent?.address ?? `${dealerInfo.city}, ${dealerInfo.state}`,
      activeTheme: websiteContent?.activeTheme ?? 'modern',
      websiteStatus: websiteContent?.websiteStatus ?? 'not_requested',
      isLive: websiteContent?.isLive ?? false,
    };
}


export async function upsertWebsiteContent(dealerId: string, content: Partial<WebsiteContent>): Promise<{ success: boolean; error?: string }> {
    const db = await getDB();
    try {
        const existing = await db.get('SELECT 1 FROM website_content WHERE dealerId = ?', dealerId);
        
        const contentToSave = { ...content };
        // Ensure boolean is saved as 0 or 1
        if (typeof contentToSave.isLive === 'boolean') {
            (contentToSave as any).isLive = contentToSave.isLive ? 1 : 0;
        }

        if (existing) {
            const fields = Object.keys(contentToSave).filter(key => key !== 'dealerId');
            if (fields.length === 0) return { success: true };
            const setClause = fields.map(field => `${field} = ?`).join(', ');
            const values = fields.map(field => (contentToSave as any)[field]);
            await db.run(`UPDATE website_content SET ${setClause} WHERE dealerId = ?`, [...values, dealerId]);
        } else {
            const columns = ['dealerId', ...Object.keys(contentToSave)];
            const placeholders = columns.map(() => '?').join(',');
            const values = [dealerId, ...Object.values(contentToSave)];
            
            await db.run(
                `INSERT INTO website_content (${columns.join(',')}) VALUES (${placeholders})`,
                ...values
            );
        }
        return { success: true };
    } catch (error: any) {
        console.error('Error upserting website content:', error);
        return { success: false, error: 'Database error while saving website content.' };
    }
}


// DATA FETCHING FUNCTIONS
export async function getDashboardData(dealerId: string) {
    const db = await getDB();
    const [
        stockValueResult,
        stockCountResult,
        availableStockResult,
        profitResult,
        leadsCountResult,
        refurbCostResult,
        totalSoldCountResult,
    ] = await Promise.all([
         db.get('SELECT SUM(price) as value FROM vehicles WHERE dealerId = ? AND status != ?', dealerId, 'Sold'),
         db.get('SELECT COUNT(*) as count FROM vehicles WHERE dealerId = ? AND status != ?', dealerId, 'Sold'),
         db.get('SELECT COUNT(*) as count FROM vehicles WHERE dealerId = ? AND status = ?', dealerId, 'For Sale'),
         db.get('SELECT SUM(sellingPrice - cost - refurbishmentCost) as total FROM vehicles WHERE dealerId = ? AND status = ?', dealerId, 'Sold'),
         db.get('SELECT COUNT(*) as count FROM leads WHERE dealerId = ? AND conversionStatus = ? AND isArchived = 0', dealerId, 'In Progress'),
         db.get('SELECT SUM(refurbishmentCost) as total FROM vehicles WHERE dealerId = ?', dealerId),
         db.get('SELECT COUNT(*) as count FROM vehicles WHERE dealerId = ? AND status = ?', dealerId, 'Sold'),
    ]);

    return {
        totalStockValue: stockValueResult?.value || 0,
        totalStockCount: stockCountResult?.count || 0,
        availableStockCount: availableStockResult?.count || 0,
        totalSalesCount: totalSoldCountResult?.count || 0,
        totalProfit: profitResult?.total || 0,
        activeLeadsCount: leadsCountResult?.count || 0,
        totalRefurbCost: refurbCostResult?.total || 0,
    };
}

export async function getAgingInventory(dealerId: string): Promise<(Vehicle & {daysInStock: number})[]> {
    const db = await getDB();
    const results = await db.all("SELECT *, CAST(julianday('now') - julianday(dateAdded) AS INTEGER) as daysInStock FROM vehicles WHERE dealerId = ? AND status = ? ORDER BY dateAdded ASC LIMIT 5", dealerId, 'For Sale');
    return results.map(v => ({...v, images: v.images ? JSON.parse(v.images) : {}})) as (Vehicle & {daysInStock: number})[];
}

export async function getAllEmployees(dealerId: string): Promise<(Employee & { salarySlips: SalarySlip[] })[]> {
    const db = await getDB();
    const employees = await db.all(`
        SELECT 
            e.*,
            (SELECT COUNT(*) FROM leads l WHERE l.assignedTo = e.id AND strftime('%Y-%m', l.dateAdded) = strftime('%Y-%m', 'now')) as "leadsThisMonth"
        FROM employees e 
        WHERE e.dealerId = ?
    `, dealerId);

    const employeesWithSlips = await Promise.all(
        employees.map(async (employee) => {
            const salarySlips = await getSalarySlipsForEmployee(employee.id);
            return { ...employee, salarySlips };
        })
    );

    return employeesWithSlips.map(e => ({...e, avatarUrl: e.avatarUrl || placeholderAvatar})) as (Employee & { salarySlips: SalarySlip[] })[];
}

export async function getEmployeeById(employeeId: string): Promise<Employee | undefined> {
    const db = await getDB();
    const employee = await db.get('SELECT * FROM employees WHERE id = ?', employeeId);
    if (!employee) return undefined;

    return {
        ...employee,
        avatarUrl: employee.avatarUrl || placeholderAvatar,
    } as Employee;
}

export async function getEmployeeByPhone(phone: string): Promise<(Employee & { dealershipName: string }) | undefined> {
    const db = await getDB();
    const employee = await db.get(`
        SELECT e.*, d.dealershipName 
        FROM employees e 
        JOIN dealers d ON e.dealerId = d.id 
        WHERE e.phone = ?
    `, phone);
    
    if (!employee) return undefined;

     return {
        ...employee,
        avatarUrl: employee.avatarUrl || placeholderAvatar,
    } as (Employee & { dealershipName: string });
}


export async function addEmployeeDb(employee: Omit<Employee, 'id' | 'avatarUrl' | 'dealerId' | 'leadsThisMonth'>, dealerId: string): Promise<{ success: boolean, error?: string }> {
    const db = await getDB();
    try {
        await db.run(
            'INSERT INTO employees (id, name, email, phone, role, salary, dealerId, avatarUrl, aadharImageUrl, password, joiningDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            crypto.randomUUID(), employee.name, employee.email, employee.phone, employee.role, employee.salary, dealerId, placeholderAvatar, employee.aadharImageUrl || null, employee.password, employee.joiningDate || new Date().toISOString()
        );
        return { success: true };
    } catch (error: any) {
        console.error('Error adding employee:', error);
        if (error.code === 'SQLITE_CONSTRAINT') {
             return { success: false, error: "An employee with this email or phone number may already exist." };
        }
        return { success: false, error: 'Failed to add employee due to a database error.' };
    }
}

export async function updateEmployeeDb(employeeId: string, data: Partial<Omit<Employee, 'id' | 'dealerId'>>): Promise<{ success: boolean, error?: string }> {
    const db = await getDB();
    try {
        const fields = Object.keys(data).filter(key => (data as any)[key] !== undefined && (key !== 'password' || (key === 'password' && (data as any)[key])));
        if (fields.length === 0) {
            return { success: true }; // Nothing to update
        }

        const setClause = fields.map((field) => `${field} = ?`).join(', ');
        const values = fields.map(field => (data as any)[field]);

        const result = await db.run(`UPDATE employees SET ${setClause} WHERE id = ?`, [...values, employeeId]);
        
        if (result.changes === 0) {
            return { success: false, error: 'Employee not found or no changes made.' };
        }

        return { success: true };
    } catch (error: any) {
        console.error('Error updating employee:', error);
        if (error.code === 'SQLITE_CONSTRAINT') {
             return { success: false, error: "An employee with this email or phone number may already exist." };
        }
        return { success: false, error: 'Failed to update employee due to a database error.' };
    }
}

export async function deleteEmployeeDb(employeeId: string): Promise<{ success: boolean; error?: string }> {
    const db = await getDB();
    try {
        const result = await db.run('DELETE FROM employees WHERE id = ?', employeeId);
        if (result.changes === 0) {
            return { success: false, error: 'Employee not found.' };
        }
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting employee:', error);
        return { success: false, error: 'Failed to delete employee due to a database error.' };
    }
}

export async function getAllLeads(dealerId: string): Promise<(Lead & { vehicleMake?: string, vehicleModel?: string, employeeName?: string })[]> {
    const db = await getDB();
    const results = await db.all(`
        SELECT 
            l.*,
            v.make as "vehicleMake",
            v.model as "vehicleModel",
            e.name as "employeeName"
        FROM leads l
        LEFT JOIN vehicles v ON l.vehicleId = v.id
        LEFT JOIN employees e ON l.assignedTo = e.id
        WHERE l.dealerId = ? AND l.isArchived = 0
        ORDER BY l.dateAdded DESC
    `, dealerId);
    return results as (Lead & { vehicleMake?: string, vehicleModel?: string, employeeName?: string })[];
}

export async function addLead(lead: Omit<Lead, 'id'>): Promise<{ success: boolean, error?: string }> {
    const db = await getDB();
    try {
        await db.run(
            `INSERT INTO leads (id, name, phone, email, vehicleId, assignedTo, testDriveStatus, conversionStatus, dateAdded, dealerId, otherVehicleName, otherVehicleReg, isArchived)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
            crypto.randomUUID(), lead.name, lead.phone, lead.email, lead.vehicleId, lead.assignedTo, lead.testDriveStatus, lead.conversionStatus, lead.dateAdded || new Date().toISOString(), lead.dealerId, lead.otherVehicleName, lead.otherVehicleReg
        );
        return { success: true };
    } catch (error: any) {
        console.error('Error adding lead:', error);
        return { success: false, error: 'Failed to add lead due to a database error.' };
    }
}

export async function getLeadsByEmployeeId(employeeId: string): Promise<Lead[]> {
    const db = await getDB();
    const results = await db.all(`
        SELECT l.*, v.make as "vehicleMake", v.model as "vehicleModel"
        FROM leads l
        LEFT JOIN vehicles v ON l.vehicleId = v.id
        WHERE l.assignedTo = ? AND l.isArchived = 0
        ORDER BY l.dateAdded DESC
    `, employeeId);
    return results as Lead[];
}

export async function getAllVehicles(dealerId: string): Promise<Vehicle[]> {
    const db = await getDB();
    const results = await db.all('SELECT * FROM vehicles WHERE dealerId = ? ORDER BY dateAdded DESC', dealerId);
    return results.map((v: any) => ({
        ...v,
        images: v.images ? JSON.parse(v.images) : { exterior: { front: placeholderImage } }
    })) as Vehicle[];
}


export async function getVehicleByIdDb(vehicleId: string, dealerId?: string): Promise<Vehicle | undefined> {
    const db = await getDB();
    
    let vehicleData;
    // If user is admin or dealerId is not provided for some reason, search by vehicleId alone.
    // Otherwise, scope to the dealerId.
    if (dealerId === 'admin-user' || !dealerId) {
        vehicleData = await db.get('SELECT * FROM vehicles WHERE id = ?', vehicleId);
    } else {
        vehicleData = await db.get('SELECT * FROM vehicles WHERE id = ? AND dealerId = ?', vehicleId, dealerId);
    }

    if (!vehicleData) return undefined;
    
    let images = {};
    try {
        if (vehicleData.images && typeof vehicleData.images === 'string' && vehicleData.images.trim().startsWith('{')) {
            images = JSON.parse(vehicleData.images);
        } else if (vehicleData.images === '"{}"' || vehicleData.images === '') {
             images = {};
        }
    } catch (e) {
        console.error("Failed to parse vehicle images JSON, using default.", e);
        images = { exterior: {}, interior: {}, tyres: {} };
    }


    const vehicleWithImages: Vehicle = {
        ...vehicleData,
        images: images,
    };
    
    if (!vehicleWithImages.images!.exterior?.front) {
       if(!vehicleWithImages.images!.exterior) vehicleWithImages.images!.exterior = {};
       vehicleWithImages.images!.exterior.front = placeholderImage;
    }

    return vehicleWithImages;
}

export async function addVehicleDb(vehicleData: Partial<Vehicle>, dealerId: string): Promise<{ success: boolean; error?: string, vehicleId?: string }> {
    const db = await getDB();
    try {
        const id = vehicleData.id || crypto.randomUUID();
        
        // Ensure all optional fields are either present or explicitly null
        const dataToInsert: { [key: string]: any } = {
            ...vehicleData,
            id,
            dealerId,
            status: vehicleData.status || 'Draft',
            dateAdded: vehicleData.dateAdded || new Date().toISOString(),
            images: typeof vehicleData.images === 'string' ? vehicleData.images : JSON.stringify(vehicleData.images || {}),
        };

        // Convert empty strings to null for optional fields
        Object.keys(dataToInsert).forEach(key => {
            if (dataToInsert[key] === '') {
                dataToInsert[key] = null;
            }
        });

        // Get all columns from the table to ensure we insert into all of them, providing NULL for missing ones
        const tableInfo = await db.all(`PRAGMA table_info(vehicles)`);
        const allColumns = tableInfo.map(info => info.name);

        const columns = allColumns.filter(col => dataToInsert[col] !== undefined);
        const placeholders = columns.map(() => '?').join(',');
        const values = columns.map(col => dataToInsert[col]);
        
        await db.run(`INSERT INTO vehicles (${columns.join(',')}) VALUES (${placeholders})`, values);
        return { success: true, vehicleId: id };
    } catch (error: any) {
        console.error('Error adding vehicle:', error);
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return { success: false, error: 'A vehicle with this registration number already exists.' };
        }
        return { success: false, error: 'Failed to add vehicle due to a database error.' };
    }
}

export async function deleteVehicleDb(vehicleId: string): Promise<{ success: boolean; error?: string }> {
    const db = await getDB();
    try {
        const result = await db.run('DELETE FROM vehicles WHERE id = ?', vehicleId);
        if (result.changes === 0) {
            return { success: false, error: 'Vehicle not found.' };
        }
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting vehicle:', error);
        return { success: false, error: 'Failed to delete vehicle due to a database error.' };
    }
}

export async function updateVehicleDb(vehicleId: string, data: Partial<Vehicle & { ownership?: number }>): Promise<{ success: boolean; error?: string }> {
    const db = await getDB();
    try {
        const dataToUpdate: { [key: string]: any } = { ...data };

        // Handle ownership to ownershipType mapping
        if (dataToUpdate.ownership !== undefined) {
            dataToUpdate.ownershipType = dataToUpdate.ownership;
            delete dataToUpdate.ownership;
        }

        // Handle images object - only stringify if it's not already a string
        if (dataToUpdate.images && typeof dataToUpdate.images !== 'string') {
            dataToUpdate.images = JSON.stringify(dataToUpdate.images);
        }

        const fields = Object.keys(dataToUpdate).filter(key => dataToUpdate[key] !== undefined && key !== 'id' && key !== 'dealerId');
        
        if (fields.length === 0) return { success: true };

        const setClause = fields.map((field) => `"${field}" = ?`).join(', ');
        
        const values = fields.map(field => {
            const value = dataToUpdate[field];
            return value === '' ? null : value;
        });

        const result = await db.run(`UPDATE vehicles SET ${setClause} WHERE id = ?`, [...values, vehicleId]);

        if (result.changes === 0) {
            return { success: false, error: 'Vehicle not found or no changes made.' };
        }
        
        if (data.status === 'Sold') {
            await archiveLeadsForVehicle(vehicleId);
        }
        
        return { success: true };
    } catch (error: any) {
        console.error('Error updating vehicle:', error);
        return { success: false, error: 'Database error while updating vehicle.' };
    }
}

export async function archiveLeadsForVehicle(vehicleId: string): Promise<{ success: boolean; error?: string }> {
    const db = await getDB();
    try {
        await db.run('UPDATE leads SET isArchived = 1 WHERE vehicleId = ?', vehicleId);
        return { success: true };
    } catch (error: any) {
        console.error('Error archiving leads:', error);
        return { success: false, error: 'Failed to archive leads due to a database error.' };
    }
}


export async function getStockOverview(dealerId: string) {
    const db = await getDB();
    const statuses: Vehicle['status'][] = ['For Sale', 'Sold', 'In Refurbishment', 'Draft'];
    const overview: any = {};

    for (const status of statuses) {
        const result = await db.all(`
            SELECT id, make, model, registrationNumber, price, sellingPrice
            FROM vehicles 
            WHERE dealerId = ? AND status = ?
            ORDER BY dateAdded DESC
        `, dealerId, status);

        overview[status] = {
            count: result.length,
            vehicles: result.slice(0, 5).map(v => ({ // Limit to 5 for tooltip
                name: `${v.make} ${v.model}`,
                reg: v.registrationNumber,
                price: v.status === 'Sold' ? v.sellingPrice : v.price,
            })),
        };
    }

    return overview;
}

export async function getAvailableVehiclesCount(dealerId: string): Promise<number> {
    const db = await getDB();
    const result = await db.get("SELECT COUNT(*) as count FROM vehicles WHERE dealerId = ? AND status = 'For Sale'", dealerId);
    return result?.count || 0;
}

// SALARY SLIP FUNCTIONS

export async function getSalarySlipsForEmployee(employeeId: string): Promise<SalarySlip[]> {
  const db = await getDB();
  return db.all('SELECT * FROM salarySlips WHERE employeeId = ? ORDER BY year DESC, month DESC', employeeId);
}

export async function generateSalarySlipDb(slipData: Omit<SalarySlip, 'id' | 'generatedDate'>): Promise<{ success: boolean; error?: string }> {
  const db = await getDB();
  try {
    await db.run(
        'INSERT INTO salarySlips (id, employeeId, dealerId, month, year, baseSalary, incentives, status, generatedDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        crypto.randomUUID(), slipData.employeeId, slipData.dealerId, slipData.month, slipData.year, slipData.baseSalary, slipData.incentives, slipData.status, new Date().toISOString()
    );
    return { success: true };
  } catch (error: any) {
    console.error('Error generating salary slip:', error);
    if (error.code === 'SQLITE_CONSTRAINT') {
      return { success: false, error: 'A salary slip for this employee for this month already exists.' };
    }
    return { success: false, error: 'Failed to generate salary slip due to a database error.' };
  }
}

// TEST FUNCTION
export async function addTestHit(name: string, phone: string): Promise<{ success: boolean; error?: string }> {
    const db = await getDB();
    try {
        await db.run(
            'INSERT INTO test_hits (name, phone) VALUES (?, ?)',
            name, phone
        );
        return { success: true };
    } catch (error: any) {
        console.error('Error adding test hit:', error);
        return { success: false, error: 'Failed to add test hit due to a database error.' };
    }
}

export async function testDbConnection() {
    try {
        await getDB();
        // This function will now be safe to call as initializeDatabase() is idempotent.
        return {
            success: true,
            message: 'Connection Successful! Database is seeded.',
            credentials: {
                host: 'N/A (local file)',
                port: 'N/A',
                database: 'src/lib/database.db',
                user: 'N/A',
            }
        };
    } catch (err: any) {
        return {
            success: false,
            message: err.message,
            credentials: {
                host: 'N/A (local file)',
                port: 'N/A',
                database: 'src/lib/database.db',
                user: 'N/A',
            }
        };
    }
}


// ADMIN FUNCTIONS
export async function fetchDealers(): Promise<(Dealer & {stats: any})[]> {
    const db = await getDB();
    try {
        const dealers = await db.all('SELECT d.*, wc.websiteStatus FROM dealers d LEFT JOIN website_content wc ON d.id = wc.dealerId');
        
        const dealersWithStats = await Promise.all(dealers.map(async (dealer) => {
            const stats = await db.get(`
                SELECT
                    (SELECT COUNT(*) FROM vehicles WHERE dealerId = ?) as totalVehicles,
                    (SELECT COUNT(*) FROM vehicles WHERE dealerId = ? AND status = 'Sold') as soldVehicles,
                    (SELECT SUM(sellingPrice - cost - refurbishmentCost) FROM vehicles WHERE dealerId = ? AND status = 'Sold') as totalProfit,
                    (SELECT SUM(sellingPrice) FROM vehicles WHERE dealerId = ? AND status = 'Sold') as soldValue,
                    (SELECT COUNT(*) FROM employees WHERE dealerId = ?) as totalEmployees,
                    (SELECT COUNT(*) FROM leads WHERE dealerId = ?) as totalLeads
            `, dealer.id, dealer.id, dealer.id, dealer.id, dealer.id, dealer.id);

            return {
                ...dealer,
                websiteStatus: dealer.websiteStatus || 'not_requested',
                stats: {
                    totalVehicles: stats.totalVehicles || 0,
                    soldVehicles: stats.soldVehicles || 0,
                    totalProfit: stats.totalProfit || 0,
                    soldValue: stats.soldValue || 0,
                    totalEmployees: stats.totalEmployees || 0,
                    totalLeads: stats.totalLeads || 0,
                }
            };
        }));
        
        return dealersWithStats;
    } catch (error) {
        console.error("Failed to fetch dealers with stats:", error);
        return [];
    }
}


export async function updateDealerStatusAction(id: string, status: Dealer['status'], reason?: string): Promise<{ success: boolean }> {
    const db = await getDB();
    try {
        if (status === 'deactivated') {
            await db.run('UPDATE dealers SET status = ?, deactivationReason = ? WHERE id = ?', status, reason, id);
        } else {
            // Clear reason if re-activating or approving
            await db.run('UPDATE dealers SET status = ?, deactivationReason = NULL WHERE id = ?', status, id);
        }
        return { success: true };
    } catch (error) {
        console.error("Failed to update status:", error);
        return { success: false };
    }
}

export async function updateWebsiteStatusAction(dealerId: string, status: WebsiteContent['websiteStatus']): Promise<{ success: boolean; error?: string }> {
    const db = await getDB();
    try {
        await upsertWebsiteContent(dealerId, { websiteStatus: status, isLive: status === 'approved' ? true : false });
        return { success: true };
    } catch (error) {
        console.error("Failed to update website status:", error);
        return { success: false, error: (error as Error).message };
    }
}

export async function deleteDealerAction(id: string): Promise<{ success: boolean; error?: string }> {
    const db = await getDB();
    try {
        await db.run('BEGIN TRANSACTION');
        await db.run('DELETE FROM website_content WHERE dealerId = ?', id);
        await db.run('DELETE FROM salarySlips WHERE dealerId = ?', id);
        await db.run('DELETE FROM leads WHERE dealerId = ?', id);
        await db.run('DELETE FROM employees WHERE dealerId = ?', id);
        await db.run('DELETE FROM vehicles WHERE dealerId = ?', id);
        await db.run('DELETE FROM dealers WHERE id = ?', id);
        await db.run('COMMIT');

        return { success: true };
    } catch (error) {
        await db.run('ROLLBACK');
        console.error("Failed to delete dealer:", error);
        return { success: false, error: (error as Error).message };
    }
}

export async function getPlatformWideStats() {
    const db = await getDB();

    const fetchDealerListByStatus = async (status?: Dealer['status']) => {
        let query = 'SELECT name, dealershipName FROM dealers WHERE id != \'admin-user\'';
        const params = [];
        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }
        query += ' ORDER BY dealershipName ASC';
        return db.all(query, ...params);
    };

    const [
        totalVehicles,
        soldVehicles,
        inStockVehicles,
        totalEmployees,
        liveWebsites,
        allDealers,
        approvedDealers,
        pendingDealers,
        deactivatedDealers
    ] = await Promise.all([
        db.get('SELECT COUNT(*) as count FROM vehicles'),
        db.get("SELECT COUNT(*) as count FROM vehicles WHERE status = 'Sold'"),
        db.get("SELECT COUNT(*) as count FROM vehicles WHERE status = 'For Sale'"),
        db.get('SELECT COUNT(*) as count FROM employees'),
        db.get("SELECT COUNT(*) as count FROM website_content WHERE isLive = 1"),
        fetchDealerListByStatus(),
        fetchDealerListByStatus('approved'),
        fetchDealerListByStatus('pending'),
        fetchDealerListByStatus('deactivated'),
    ]);

    return {
        totalVehicles: totalVehicles?.count || 0,
        soldVehicles: soldVehicles?.count || 0,
        inStockVehicles: inStockVehicles?.count || 0,
        totalEmployees: totalEmployees?.count || 0,
        liveWebsites: liveWebsites?.count || 0,
        allDealers,
        approvedDealers,
        pendingDealers,
        deactivatedDealers,
    }
}

